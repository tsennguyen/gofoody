using GoFoody.Api.Features.Search;
using GoFoody.Infrastructure.Data;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace GoFoody.Api.Features.Search;

[ApiController]
[Route("api/[controller]")]
public sealed class SearchController : ControllerBase
{
    private readonly GoFoodyDbContext _db;

    public SearchController(GoFoodyDbContext db)
    {
        _db = db;
    }

    [HttpPost("products")]
    public async Task<ActionResult<ProductSearchResponse>> SearchProducts(
        [FromBody] ProductSearchFilterRequest request,
        CancellationToken cancellationToken)
    {
        var queryText = request.Query?.Trim();
        var hasQuery = !string.IsNullOrWhiteSpace(queryText);
        var page = request.Page < 1 ? 1 : request.Page;
        var pageSize = request.PageSize is < 1 or > 50 ? 12 : request.PageSize;

        var dietTags = request.DietTags?
            .Where(t => !string.IsNullOrWhiteSpace(t))
            .Select(t => t.Trim().ToLowerInvariant())
            .Distinct()
            .ToList() ?? new List<string>();

        var ingredientTags = request.IngredientTags?
            .Where(t => !string.IsNullOrWhiteSpace(t))
            .Select(t => t.Trim().ToLowerInvariant())
            .Distinct()
            .ToList() ?? new List<string>();

        var productsQuery = _db.Products
            .AsNoTracking()
            .Where(p => p.IsActive)
            .Where(p => !request.CategoryId.HasValue || p.CategoryId == request.CategoryId)
            .Where(p => !request.MinPrice.HasValue || p.ProductVariants.Any(v => v.Status == 1 && v.Price >= request.MinPrice))
            .Where(p => !request.MaxPrice.HasValue || p.ProductVariants.Any(v => v.Status == 1 && v.Price <= request.MaxPrice));

        if (dietTags.Count > 0)
        {
            productsQuery = productsQuery.Where(p =>
                p.ProductTags.Any(pt => pt.Tag != null
                    && pt.Tag.TagType == "Diet"
                    && dietTags.Contains(pt.Tag.Slug)));
        }

        if (ingredientTags.Count > 0)
        {
            productsQuery = productsQuery.Where(p =>
                p.ProductTags.Any(pt => pt.Tag != null
                    && pt.Tag.TagType == "Ingredient"
                    && ingredientTags.Contains(pt.Tag.Slug)));
        }

        if (hasQuery)
        {
            var lowered = queryText!;
            productsQuery = productsQuery.Where(p =>
                EF.Functions.Like(p.Name, $"%{lowered}%")
                || (!string.IsNullOrEmpty(p.ShortDescription) && EF.Functions.Like(p.ShortDescription!, $"%{lowered}%"))
                || (p.Category != null && EF.Functions.Like(p.Category.Name, $"%{lowered}%"))
                || p.ProductTags.Any(pt => pt.Tag != null && EF.Functions.Like(pt.Tag.Name, $"%{lowered}%")));
        }

        var projected = productsQuery
            .Select(p => new
            {
                Product = p,
                CategoryName = p.Category != null ? p.Category.Name : string.Empty,
                Tags = p.ProductTags.Select(pt => new { pt.Tag!.Slug, pt.Tag.TagType, pt.Tag.Name }),
                MinPrice = p.ProductVariants.Where(v => v.Status == 1).Min(v => (decimal?)v.Price) ?? 0,
                MaxPrice = p.ProductVariants.Where(v => v.Status == 1).Max(v => (decimal?)v.Price),
                RequiresColdShipping = p.ProductVariants.Any(v => v.Status == 1 && v.RequireColdShipping),
                Score = hasQuery
                    ? ((EF.Functions.Like(p.Name, $"%{queryText!}%") ? 3 : 0)
                       + (p.Category != null && EF.Functions.Like(p.Category.Name, $"%{queryText!}%") ? 2 : 0)
                       + (p.ProductTags.Any(pt => pt.Tag != null && EF.Functions.Like(pt.Tag.Name, $"%{queryText!}%")) ? 1 : 0))
                    : 0
            });

        projected = request.SortBy switch
        {
            "price_asc" => projected.OrderBy(x => x.MinPrice).ThenBy(x => x.Product.Name),
            "price_desc" => projected.OrderByDescending(x => x.MinPrice).ThenBy(x => x.Product.Name),
            "newest" => projected.OrderByDescending(x => x.Product.CreatedAt),
            _ => projected.OrderByDescending(x => x.Score).ThenBy(x => x.Product.Name)
        };

        var totalItems = await projected.CountAsync(cancellationToken);
        var totalPages = (int)Math.Ceiling(totalItems / (double)pageSize);

        var items = await projected
            .Skip((page - 1) * pageSize)
            .Take(pageSize)
            .ToListAsync(cancellationToken);

        var resultItems = items.Select(x => new ProductSearchResultItemDto(
            x.Product.Id,
            x.Product.Name,
            x.Product.Slug,
            x.CategoryName,
            x.Product.ShortDescription,
            x.MinPrice,
            x.MaxPrice,
            x.RequiresColdShipping,
            x.Tags.Where(t => t.TagType == "Diet").Select(t => t.Name).ToList(),
            x.Tags.Where(t => t.TagType == "Ingredient").Select(t => t.Name).ToList()
        )).ToList();

        var suggestedTerms = new List<string>();
        if (hasQuery)
        {
            var productTerms = await _db.Products.AsNoTracking()
                .Where(p => p.IsActive && EF.Functions.Like(p.Name, $"{queryText}%"))
                .Select(p => p.Name)
                .Take(5)
                .ToListAsync(cancellationToken);

            var categoryTerms = await _db.Categories.AsNoTracking()
                .Where(c => EF.Functions.Like(c.Name, $"{queryText}%"))
                .Select(c => c.Name)
                .Take(5)
                .ToListAsync(cancellationToken);

            var tagTerms = await _db.Tags.AsNoTracking()
                .Where(t => t.IsActive && EF.Functions.Like(t.Name, $"{queryText}%"))
                .Select(t => t.Name)
                .Take(5)
                .ToListAsync(cancellationToken);

            suggestedTerms = productTerms
                .Concat(categoryTerms)
                .Concat(tagTerms)
                .Distinct(StringComparer.OrdinalIgnoreCase)
                .Take(8)
                .ToList();
        }

        var response = new ProductSearchResponse(
            page,
            pageSize,
            totalItems,
            totalPages,
            resultItems,
            suggestedTerms
        );

        return Ok(response);
    }

    [HttpGet("suggestions")]
    public async Task<ActionResult<IReadOnlyList<SearchSuggestionDto>>> GetSuggestions(
        [FromQuery(Name = "q")] string q,
        CancellationToken cancellationToken)
    {
        if (string.IsNullOrWhiteSpace(q) || q.Trim().Length < 2)
        {
            return BadRequest("q is required and must be at least 2 characters.");
        }

        var term = q.Trim();

        var productSuggestions = await _db.Products
            .AsNoTracking()
            .Where(p => p.IsActive && EF.Functions.Like(p.Name, $"%{term}%"))
            .OrderBy(p => p.Name)
            .Select(p => new SearchSuggestionDto(p.Name, "ProductName", p.Id, null))
            .Take(5)
            .ToListAsync(cancellationToken);

        var categorySuggestions = await _db.Categories
            .AsNoTracking()
            .Where(c => EF.Functions.Like(c.Name, $"%{term}%"))
            .OrderBy(c => c.Name)
            .Select(c => new SearchSuggestionDto(c.Name, "Category", null, c.Id))
            .Take(3)
            .ToListAsync(cancellationToken);

        var tagSuggestions = await _db.Tags
            .AsNoTracking()
            .Where(t => t.IsActive && EF.Functions.Like(t.Name, $"%{term}%"))
            .OrderBy(t => t.Name)
            .Select(t => new SearchSuggestionDto(t.Name, "Tag", null, null))
            .Take(3)
            .ToListAsync(cancellationToken);

        var combined = productSuggestions
            .Concat(categorySuggestions)
            .Concat(tagSuggestions)
            .Take(10)
            .ToList();

        return Ok(combined);
    }
}
