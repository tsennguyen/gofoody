using GoFoody.Api.Features.Catalog.Models;
using GoFoody.Infrastructure.Data;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace GoFoody.Api.Features.Catalog;

[ApiController]
[Route("api/[controller]")]
public class ProductsController : ControllerBase
{
    private readonly GoFoodyDbContext _dbContext;

    public ProductsController(GoFoodyDbContext dbContext)
    {
        _dbContext = dbContext;
    }

    public sealed class ProductQuery
    {
        public int Page { get; init; } = 1;
        public int PageSize { get; init; } = 12;
        public int? CategoryId { get; init; }
        public string? CategorySlug { get; init; }
        public string? Keyword { get; init; }
        public decimal? MinPrice { get; init; }
        public decimal? MaxPrice { get; init; }
        public bool? IsOrganic { get; init; }
        public bool? HasHaccp { get; init; }
        public bool? IsSeasonal { get; init; }
        public bool? RequiresColdShipping { get; init; }
        public string? Sort { get; init; }
    }

    [HttpGet]
    public async Task<ActionResult<PagedResult<ProductListItemDto>>> GetProducts(
        [FromQuery] ProductQuery query,
        CancellationToken cancellationToken)
    {
        var page = query.Page <= 0 ? 1 : query.Page;
        var pageSize = query.PageSize <= 0 ? 12 : query.PageSize;
        pageSize = Math.Clamp(pageSize, 1, 48);

        var keyword = query.Keyword?.Trim().ToLower();
        var categorySlug = query.CategorySlug?.Trim().ToLower();

        var baseQuery = _dbContext.Products
            .AsNoTracking()
            .Where(p => p.IsActive);

        if (query.CategoryId.HasValue)
        {
            baseQuery = baseQuery.Where(p => p.CategoryId == query.CategoryId.Value);
        }
        else if (!string.IsNullOrWhiteSpace(categorySlug))
        {
            baseQuery = baseQuery.Where(p => p.Category != null && p.Category.Slug.ToLower() == categorySlug);
        }

        if (!string.IsNullOrWhiteSpace(keyword))
        {
            baseQuery = baseQuery.Where(p => p.Name.ToLower().Contains(keyword));
        }

        if (query.IsOrganic.HasValue)
        {
            baseQuery = baseQuery.Where(p => p.IsOrganic == query.IsOrganic.Value);
        }

        if (query.HasHaccp.HasValue)
        {
            baseQuery = baseQuery.Where(p => p.HasHaccpCert == query.HasHaccp.Value);
        }

        if (query.IsSeasonal.HasValue)
        {
            baseQuery = baseQuery.Where(p => p.IsSeasonal == query.IsSeasonal.Value);
        }

        if (query.RequiresColdShipping.HasValue)
        {
            baseQuery = baseQuery.Where(p => p.ProductVariants.Any(v => v.RequireColdShipping == query.RequiresColdShipping.Value));
        }

        if (query.MinPrice.HasValue)
        {
            baseQuery = baseQuery.Where(p => p.ProductVariants.Any(v => v.Price >= query.MinPrice.Value));
        }

        if (query.MaxPrice.HasValue)
        {
            baseQuery = baseQuery.Where(p => p.ProductVariants.Any(v => v.Price <= query.MaxPrice.Value));
        }

        // Đảm bảo chỉ lấy sản phẩm có ít nhất 1 biến thể giá.
        baseQuery = baseQuery.Where(p => p.ProductVariants.Any());

        var totalItems = await baseQuery.CountAsync(cancellationToken);

        var projected = baseQuery.Select(p => new
        {
            p.Id,
            p.Name,
            p.Slug,
            CategoryName = p.Category != null ? p.Category.Name : string.Empty,
            p.IsOrganic,
            p.HasHaccpCert,
            p.IsSeasonal,
            p.CreatedAt,
            MinPrice = p.ProductVariants.Select(v => (decimal?)v.Price).Min() ?? 0m,
            MaxPrice = p.ProductVariants.Select(v => (decimal?)v.Price).Max(),
            RequiresColdShipping = p.ProductVariants.Any(v => v.RequireColdShipping),
            ThumbnailUrl = p.ProductImages
                .OrderByDescending(img => img.IsDefault)
                .ThenBy(img => img.SortOrder)
                .Select(img => img.ImageUrl)
                .FirstOrDefault()
        });

        projected = query.Sort switch
        {
            "priceAsc" => projected.OrderBy(p => p.MinPrice),
            "priceDesc" => projected.OrderByDescending(p => p.MinPrice),
            _ => projected.OrderByDescending(p => p.CreatedAt), // default newest
        };

        var items = await projected
            .Skip((page - 1) * pageSize)
            .Take(pageSize)
            .Select(p => new ProductListItemDto(
                p.Id,
                p.Name,
                p.Slug,
                p.CategoryName,
                p.MinPrice,
                p.MaxPrice,
                p.IsOrganic,
                p.HasHaccpCert,
                p.IsSeasonal,
                p.RequiresColdShipping,
                p.ThumbnailUrl))
            .ToListAsync(cancellationToken);

        var totalPages = (int)Math.Ceiling(totalItems / (double)pageSize);
        var result = new PagedResult<ProductListItemDto>(items, page, pageSize, totalItems, totalPages);

        return Ok(result);
    }

    [HttpGet("{slug}")]
    public async Task<ActionResult<ProductDetailDto>> GetBySlug(string slug, CancellationToken cancellationToken)
    {
        if (string.IsNullOrWhiteSpace(slug))
        {
            return BadRequest("Slug is required.");
        }

        var normalized = slug.Trim().ToLowerInvariant();

        var productData = await _dbContext.Products
            .AsNoTracking()
            .Where(p => p.IsActive && p.Slug.ToLower() == normalized)
            .Select(p => new
            {
                Product = p,
                Category = p.Category
            })
            .FirstOrDefaultAsync(cancellationToken);

        if (productData is null)
        {
            return NotFound();
        }

        var productId = productData.Product.Id;

        var variants = await _dbContext.ProductVariants
            .AsNoTracking()
            .Where(v => v.ProductId == productId && v.Status == 1)
            .ToListAsync(cancellationToken);

        var minPrice = variants.Count > 0 ? variants.Min(v => v.Price) : 0m;
        var maxPrice = variants.Count > 0 ? variants.Max(v => v.Price) : (decimal?)null;

        var images = await _dbContext.ProductImages
            .AsNoTracking()
            .Where(i => i.ProductId == productId)
            .OrderByDescending(i => i.IsDefault)
            .ThenBy(i => i.SortOrder)
            .Select(i => new ProductImageDto(
                i.Id,
                i.ImageUrl,
                i.IsDefault,
                i.SortOrder
            ))
            .ToListAsync(cancellationToken);

        var reviewStats = await _dbContext.Reviews
            .AsNoTracking()
            .Where(r => r.ProductId == productId && r.IsApproved)
            .GroupBy(r => r.ProductId)
            .Select(g => new
            {
                AverageRating = g.Average(r => (double)r.Rating),
                TotalReviews = g.Count()
            })
            .FirstOrDefaultAsync(cancellationToken);

        var reviewSummary = reviewStats is null
            ? new ReviewSummaryDto(0, 0)
            : new ReviewSummaryDto(Math.Round(reviewStats.AverageRating, 1), reviewStats.TotalReviews);

        var variantDtos = variants
            .Select(v => new ProductVariantDto(
                v.Id,
                v.Name,
                v.Unit,
                v.WeightGrams,
                v.Price,
                v.ListPrice,
                v.IsFresh,
                v.IsFrozen,
                v.IsPrecut,
                v.RequireColdShipping,
                v.StockQuantity,
                v.MinOrderQuantity,
                v.MaxOrderQuantity
            ))
            .ToList();

        var dto = new ProductDetailDto(
            productData.Product.Id,
            productData.Product.Name,
            productData.Product.Slug,
            productData.Category?.Name ?? string.Empty,
            productData.Category?.Slug,
            productData.Product.ShortDescription,
            productData.Product.Description,
            productData.Product.OriginCountry,
            productData.Product.Brand,
            productData.Product.IsOrganic,
            productData.Product.HasHaccpCert,
            productData.Product.IsSeasonal,
            productData.Product.StorageCondition,
            productData.Product.StorageTempMin,
            productData.Product.StorageTempMax,
            minPrice,
            maxPrice,
            variantDtos,
            images,
            reviewSummary
        );

        return Ok(dto);
    }
}
