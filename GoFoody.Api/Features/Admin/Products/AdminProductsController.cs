using GoFoody.Api.Features.Admin.Products;
using GoFoody.Api.Features.Catalog.Models;
using GoFoody.Infrastructure.Data;
using GoFoody.Infrastructure.Entities;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace GoFoody.Api.Features.Admin.Products;

[ApiController]
[Route("api/admin/products")]
[Authorize(Roles = "ADMIN")]
public sealed class AdminProductsController : ControllerBase
{
    private readonly GoFoodyDbContext _db;

    public AdminProductsController(GoFoodyDbContext db)
    {
        _db = db;
    }

    [HttpGet]
    public async Task<ActionResult<PagedResult<ProductAdminListItemDto>>> GetList(
        [FromQuery] int page = 1,
        [FromQuery] int pageSize = 20,
        [FromQuery] string? keyword = null,
        [FromQuery] int? categoryId = null,
        [FromQuery] bool? isActive = null,
        CancellationToken cancellationToken = default)
    {
        page = page < 1 ? 1 : page;
        pageSize = Math.Clamp(pageSize, 1, 100);

        var query = _db.Products
            .AsNoTracking()
            .Include(p => p.ProductVariants)
            .Include(p => p.Category)
            .AsQueryable();

        if (!string.IsNullOrWhiteSpace(keyword))
        {
            var kw = keyword.Trim().ToLower();
            query = query.Where(p => p.Name.ToLower().Contains(kw) || p.Slug.ToLower().Contains(kw));
        }

        if (categoryId.HasValue) query = query.Where(p => p.CategoryId == categoryId.Value);
        if (isActive.HasValue) query = query.Where(p => p.IsActive == isActive.Value);

        var totalItems = await query.CountAsync(cancellationToken);

        var items = await query
            .OrderByDescending(p => p.CreatedAt)
            .Skip((page - 1) * pageSize)
            .Take(pageSize)
            .Select(p => new ProductAdminListItemDto(
                p.Id,
                p.Name,
                p.Slug,
                p.Category != null ? p.Category.Name : string.Empty,
                p.IsActive,
                p.ProductVariants.Where(v => v.Status != 0).Select(v => (decimal?)v.Price).Min() ?? 0,
                p.ProductVariants.Where(v => v.Status != 0).Select(v => (decimal?)v.Price).Max(),
                p.ProductVariants.Sum(v => v.StockQuantity),
                p.ProductVariants.Any(v => v.RequireColdShipping),
                p.CreatedAt
            ))
            .ToListAsync(cancellationToken);

        var totalPages = (int)Math.Ceiling(totalItems / (double)pageSize);
        return Ok(new PagedResult<ProductAdminListItemDto>(items, page, pageSize, totalItems, totalPages));
    }

    [HttpGet("{id:int}")]
    public async Task<ActionResult<ProductAdminDetailDto>> GetDetail(int id, CancellationToken cancellationToken)
    {
        var product = await _db.Products
            .AsNoTracking()
            .Include(p => p.Category)
            .Include(p => p.ProductVariants)
            .Include(p => p.ProductImages)
            .FirstOrDefaultAsync(p => p.Id == id, cancellationToken);

        if (product is null) return NotFound();

        var detail = new ProductAdminDetailDto(
            product.Id,
            product.Name,
            product.Slug,
            product.CategoryId,
            product.Category?.Name ?? string.Empty,
            product.ShortDescription,
            product.Description,
            product.OriginCountry,
            product.Brand,
            product.IsOrganic,
            product.HasHaccpCert,
            product.IsSeasonal,
            product.StorageCondition,
            product.StorageTempMin,
            product.StorageTempMax,
            product.IsActive,
            product.ProductVariants.Select(v => new ProductVariantAdminDto(
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
                v.MaxOrderQuantity,
                v.Status != 0)).ToList(),
            product.ProductImages
                .OrderByDescending(i => i.IsDefault)
                .ThenBy(i => i.SortOrder)
                .Select(i => new ProductImageAdminDto(i.Id, i.ImageUrl, i.IsDefault, i.SortOrder))
                .ToList()
        );

        return Ok(detail);
    }

    [HttpPost]
    public async Task<ActionResult<ProductAdminDetailDto>> Create(
        [FromBody] ProductAdminUpsertRequest request,
        CancellationToken cancellationToken)
    {
        if (string.IsNullOrWhiteSpace(request.Name)) return BadRequest("Name is required.");
        if (request.Variants is null || !request.Variants.Any()) return BadRequest("At least one variant is required.");

        var categoryExists = await _db.Categories.AnyAsync(c => c.Id == request.CategoryId && c.IsActive, cancellationToken);
        if (!categoryExists) return BadRequest("Category not found or inactive.");

        var slug = string.IsNullOrWhiteSpace(request.Slug) ? Slugify(request.Name) : Slugify(request.Slug);
        var exists = await _db.Products.AnyAsync(p => p.Slug == slug, cancellationToken);
        if (exists) return BadRequest("Slug already exists.");

        var product = new Product
        {
            Name = request.Name,
            Slug = slug,
            CategoryId = request.CategoryId,
            ShortDescription = request.ShortDescription,
            Description = request.Description,
            OriginCountry = request.OriginCountry,
            Brand = request.Brand,
            IsOrganic = request.IsOrganic,
            HasHaccpCert = request.HasHaccpCert,
            IsSeasonal = request.IsSeasonal,
            StorageCondition = request.StorageCondition,
            StorageTempMin = request.StorageTempMin,
            StorageTempMax = request.StorageTempMax,
            IsActive = request.IsActive,
            CreatedAt = DateTime.UtcNow
        };

        foreach (var v in request.Variants)
        {
            product.ProductVariants.Add(new ProductVariant
            {
                Name = v.Name,
                Unit = v.Unit,
                WeightGrams = v.WeightGrams,
                Price = v.Price,
                ListPrice = v.ListPrice,
                IsFresh = v.IsFresh,
                IsFrozen = v.IsFrozen,
                IsPrecut = v.IsPrecut,
                RequireColdShipping = v.RequiresColdShipping,
                StockQuantity = v.StockQuantity,
                MinOrderQuantity = v.MinOrderQuantity,
                MaxOrderQuantity = v.MaxOrderQuantity,
                Status = (byte)(v.IsActive ? 1 : 0)
            });
        }

        foreach (var img in request.Images)
        {
            product.ProductImages.Add(new ProductImage
            {
                ImageUrl = img.ImageUrl,
                IsDefault = img.IsDefault,
                SortOrder = img.SortOrder
            });
        }

        _db.Products.Add(product);
        await _db.SaveChangesAsync(cancellationToken);

        return await GetDetail(product.Id, cancellationToken);
    }

    [HttpPut("{id:int}")]
    public async Task<ActionResult<ProductAdminDetailDto>> Update(
        int id,
        [FromBody] ProductAdminUpsertRequest request,
        CancellationToken cancellationToken)
    {
        var product = await _db.Products
            .Include(p => p.ProductVariants)
            .Include(p => p.ProductImages)
            .FirstOrDefaultAsync(p => p.Id == id, cancellationToken);
        if (product is null) return NotFound();

        if (string.IsNullOrWhiteSpace(request.Name)) return BadRequest("Name is required.");
        if (request.Variants is null || !request.Variants.Any()) return BadRequest("At least one variant is required.");

        var categoryExists = await _db.Categories.AnyAsync(c => c.Id == request.CategoryId && c.IsActive, cancellationToken);
        if (!categoryExists) return BadRequest("Category not found or inactive.");

        var slug = string.IsNullOrWhiteSpace(request.Slug) ? Slugify(request.Name) : Slugify(request.Slug);
        var exists = await _db.Products.AnyAsync(p => p.Slug == slug && p.Id != id, cancellationToken);
        if (exists) return BadRequest("Slug already exists.");

        product.Name = request.Name;
        product.Slug = slug;
        product.CategoryId = request.CategoryId;
        product.ShortDescription = request.ShortDescription;
        product.Description = request.Description;
        product.OriginCountry = request.OriginCountry;
        product.Brand = request.Brand;
        product.IsOrganic = request.IsOrganic;
        product.HasHaccpCert = request.HasHaccpCert;
        product.IsSeasonal = request.IsSeasonal;
        product.StorageCondition = request.StorageCondition;
        product.StorageTempMin = request.StorageTempMin;
        product.StorageTempMax = request.StorageTempMax;
        product.IsActive = request.IsActive;
        product.UpdatedAt = DateTime.UtcNow;

        // Variants upsert
        var existingVariants = product.ProductVariants.ToDictionary(v => v.Id);
        var incomingVariantIds = new HashSet<int>();
        foreach (var v in request.Variants)
        {
            if (v.Id is null)
            {
                product.ProductVariants.Add(new ProductVariant
                {
                    Name = v.Name,
                    Unit = v.Unit,
                    WeightGrams = v.WeightGrams,
                    Price = v.Price,
                    ListPrice = v.ListPrice,
                    IsFresh = v.IsFresh,
                    IsFrozen = v.IsFrozen,
                    IsPrecut = v.IsPrecut,
                    RequireColdShipping = v.RequiresColdShipping,
                    StockQuantity = v.StockQuantity,
                    MinOrderQuantity = v.MinOrderQuantity,
                    MaxOrderQuantity = v.MaxOrderQuantity,
                    Status = (byte)(v.IsActive ? 1 : 0)
                });
            }
            else if (existingVariants.TryGetValue(v.Id.Value, out var entity))
            {
                incomingVariantIds.Add(v.Id.Value);
                entity.Name = v.Name;
                entity.Unit = v.Unit;
                entity.WeightGrams = v.WeightGrams;
                entity.Price = v.Price;
                entity.ListPrice = v.ListPrice;
                entity.IsFresh = v.IsFresh;
                entity.IsFrozen = v.IsFrozen;
                entity.IsPrecut = v.IsPrecut;
                entity.RequireColdShipping = v.RequiresColdShipping;
                entity.StockQuantity = v.StockQuantity;
                entity.MinOrderQuantity = v.MinOrderQuantity;
                entity.MaxOrderQuantity = v.MaxOrderQuantity;
                entity.Status = (byte)(v.IsActive ? 1 : 0);
            }
        }
        foreach (var kv in existingVariants)
        {
            if (!incomingVariantIds.Contains(kv.Key))
            {
                kv.Value.Status = 0;
            }
        }

        // Images upsert
        var existingImages = product.ProductImages.ToDictionary(i => i.Id);
        var incomingImgIds = new HashSet<int>();
        foreach (var img in request.Images)
        {
            if (img.Id is null)
            {
                product.ProductImages.Add(new ProductImage
                {
                    ImageUrl = img.ImageUrl,
                    IsDefault = img.IsDefault,
                    SortOrder = img.SortOrder
                });
            }
            else if (existingImages.TryGetValue(img.Id.Value, out var entity))
            {
                incomingImgIds.Add(img.Id.Value);
                entity.ImageUrl = img.ImageUrl;
                entity.IsDefault = img.IsDefault;
                entity.SortOrder = img.SortOrder;
            }
        }
        foreach (var kv in existingImages)
        {
            if (!incomingImgIds.Contains(kv.Key))
            {
                _db.ProductImages.Remove(kv.Value);
            }
        }

        await _db.SaveChangesAsync(cancellationToken);
        return await GetDetail(id, cancellationToken);
    }

    [HttpDelete("{id:int}")]
    public async Task<IActionResult> Delete(int id, CancellationToken cancellationToken)
    {
        var product = await _db.Products.Include(p => p.ProductVariants).FirstOrDefaultAsync(p => p.Id == id, cancellationToken);
        if (product is null) return NotFound();
        product.IsActive = false;
        foreach (var v in product.ProductVariants)
        {
            v.Status = 0;
        }
        await _db.SaveChangesAsync(cancellationToken);
        return NoContent();
    }

    private static string Slugify(string input)
    {
        var slug = input.Trim().ToLowerInvariant();
        slug = System.Text.RegularExpressions.Regex.Replace(slug, @"[^a-z0-9\s-]", "");
        slug = System.Text.RegularExpressions.Regex.Replace(slug, @"\s+", "-");
        slug = System.Text.RegularExpressions.Regex.Replace(slug, @"-+", "-");
        return slug.Trim('-');
    }
}
