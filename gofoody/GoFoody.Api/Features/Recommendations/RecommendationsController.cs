using GoFoody.Api.Common;
using GoFoody.Api.Features.Orders.Models;
using GoFoody.Api.Features.Search;
using GoFoody.Infrastructure.Data;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace GoFoody.Api.Features.Recommendations;

[ApiController]
[Route("api/[controller]")]
public sealed class RecommendationsController : ControllerBase
{
    private readonly GoFoodyDbContext _db;

    public RecommendationsController(GoFoodyDbContext db)
    {
        _db = db;
    }

    [HttpGet("frequently-bought-together/{productId:int}")]
    public async Task<ActionResult<ProductRecommendationsResponse>> GetFrequentlyBoughtTogether(
        int productId,
        CancellationToken cancellationToken)
    {
        var orderIds = await _db.OrderItems
            .AsNoTracking()
            .Where(oi => oi.ProductId == productId)
            .Select(oi => oi.OrderId)
            .Distinct()
            .ToListAsync(cancellationToken);

        if (orderIds.Count == 0)
        {
            return Ok(new ProductRecommendationsResponse(Array.Empty<ProductRecommendationItemDto>()));
        }

        var coPurchased = await _db.OrderItems
            .AsNoTracking()
            .Where(oi => orderIds.Contains(oi.OrderId) && oi.ProductId != productId)
            .GroupBy(oi => oi.ProductId)
            .Select(g => new { ProductId = g.Key, Count = g.Count() })
            .OrderByDescending(x => x.Count)
            .Take(10)
            .ToListAsync(cancellationToken);

        var coProductIds = coPurchased.Select(x => x.ProductId).ToList();
        if (coProductIds.Count == 0)
        {
            return Ok(new ProductRecommendationsResponse(Array.Empty<ProductRecommendationItemDto>()));
        }

        var products = await _db.Products
            .AsNoTracking()
            .Where(p => coProductIds.Contains(p.Id) && p.IsActive)
            .Select(p => new
            {
                p.Id,
                p.Name,
                p.Slug,
                CategoryName = p.Category != null ? p.Category.Name : string.Empty,
                MinPrice = p.ProductVariants.Where(v => v.Status == 1).Min(v => (decimal?)v.Price) ?? 0,
                MaxPrice = p.ProductVariants.Where(v => v.Status == 1).Max(v => (decimal?)v.Price)
            })
            .ToListAsync(cancellationToken);

        var result = products
            .Select(p => new ProductRecommendationItemDto(
                p.Id,
                p.Name,
                p.Slug,
                p.CategoryName,
                p.MinPrice,
                p.MaxPrice,
                "Thường được mua kèm với sản phẩm này"
            ))
            .ToList();

        return Ok(new ProductRecommendationsResponse(result));
    }

    [Authorize(Roles = "CUSTOMER")]
    [HttpGet("for-me")]
    public async Task<ActionResult<ProductRecommendationsResponse>> GetRecommendationsForMe(
        CancellationToken cancellationToken)
    {
        var userId = User.GetUserId();
        if (!userId.HasValue)
        {
            return Unauthorized();
        }

        var completedOrders = await _db.Orders
            .AsNoTracking()
            .Where(o => o.UserId == userId && o.Status == (int)OrderStatus.Completed)
            .Select(o => o.Id)
            .ToListAsync(cancellationToken);

        if (completedOrders.Count == 0)
        {
            return Ok(new ProductRecommendationsResponse(Array.Empty<ProductRecommendationItemDto>()));
        }

        var purchasedItems = await _db.OrderItems
            .AsNoTracking()
            .Where(oi => completedOrders.Contains(oi.OrderId))
            .Select(oi => new
            {
                oi.ProductId,
                CategoryId = oi.Product != null ? (int?)oi.Product.CategoryId : null
            })
            .ToListAsync(cancellationToken);

        var purchasedProductIds = purchasedItems.Select(pi => pi.ProductId).Distinct().ToHashSet();
        var categoryCounts = purchasedItems
            .Where(pi => pi.CategoryId.HasValue)
            .GroupBy(pi => pi.CategoryId!.Value)
            .Select(g => new { CategoryId = g.Key, Count = g.Count() })
            .OrderByDescending(x => x.Count)
            .Take(3)
            .ToList();

        var topCategoryIds = categoryCounts.Select(c => c.CategoryId).ToList();

        var topTagIds = await _db.ProductTags
            .AsNoTracking()
            .Where(pt => purchasedProductIds.Contains(pt.ProductId))
            .GroupBy(pt => pt.TagId)
            .Select(g => new { TagId = g.Key, Count = g.Count() })
            .OrderByDescending(x => x.Count)
            .Take(10)
            .Select(x => x.TagId)
            .ToListAsync(cancellationToken);

        var candidatesQuery = _db.Products
            .AsNoTracking()
            .Where(p => p.IsActive)
            .Where(p => !purchasedProductIds.Contains(p.Id))
            .Where(p =>
                (topCategoryIds.Count > 0 && topCategoryIds.Contains(p.CategoryId))
                || (topTagIds.Count > 0 && p.ProductTags.Any(pt => topTagIds.Contains(pt.TagId))));

        var candidates = await candidatesQuery
            .Select(p => new
            {
                p.Id,
                p.Name,
                p.Slug,
                CategoryName = p.Category != null ? p.Category.Name : string.Empty,
                CategoryId = p.CategoryId,
                MinPrice = p.ProductVariants.Where(v => v.Status == 1).Min(v => (decimal?)v.Price) ?? 0,
                MaxPrice = p.ProductVariants.Where(v => v.Status == 1).Max(v => (decimal?)v.Price),
                OrderCount = p.OrderItems.Count,
                TagIds = p.ProductTags.Select(pt => pt.TagId)
            })
            .OrderByDescending(x => x.OrderCount)
            .ThenBy(x => x.Name)
            .Take(10)
            .ToListAsync(cancellationToken);

        var tagLookup = await _db.Tags
            .AsNoTracking()
            .Where(t => topTagIds.Contains(t.Id))
            .ToDictionaryAsync(t => t.Id, t => t.Name, cancellationToken);

        var results = new List<ProductRecommendationItemDto>();
        foreach (var item in candidates)
        {
            string reason;
            if (topCategoryIds.Contains(item.CategoryId))
            {
                reason = $"Vì bạn thường mua trong danh mục {item.CategoryName}";
            }
            else
            {
                var matchTagId = item.TagIds.FirstOrDefault(id => tagLookup.ContainsKey(id));
                reason = matchTagId != 0
                    ? $"Phù hợp với sở thích {tagLookup[matchTagId]}"
                    : "Dựa trên lịch sử mua hàng";
            }

            results.Add(new ProductRecommendationItemDto(
                item.Id,
                item.Name,
                item.Slug,
                item.CategoryName,
                item.MinPrice,
                item.MaxPrice,
                reason
            ));
        }

        return Ok(new ProductRecommendationsResponse(results));
    }
}
