using GoFoody.Api.Features.Catalog.Models;
using GoFoody.Api.Features.Reviews.Models;
using GoFoody.Api.Common;
using GoFoody.Infrastructure.Data;
using GoFoody.Infrastructure.Entities;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace GoFoody.Api.Features.Reviews;

[ApiController]
[Route("api/[controller]")]
public sealed class ReviewsController : ControllerBase
{
    private readonly GoFoodyDbContext _db;

    public ReviewsController(GoFoodyDbContext db)
    {
        _db = db;
    }

    [HttpGet]
    public async Task<ActionResult<PagedResult<ReviewDto>>> GetReviews(
        [FromQuery] int productId,
        [FromQuery] int page = 1,
        [FromQuery] int pageSize = 10,
        [FromQuery] bool onlyApproved = true,
        CancellationToken cancellationToken = default)
    {
        if (productId <= 0)
        {
            return BadRequest("productId is required.");
        }

        page = page < 1 ? 1 : page;
        pageSize = pageSize < 1 ? 10 : pageSize;
        pageSize = Math.Clamp(pageSize, 1, 50);

        var query = _db.Reviews
            .AsNoTracking()
            .Where(r => r.ProductId == productId);

        if (onlyApproved)
        {
            query = query.Where(r => r.IsApproved);
        }

        var totalItems = await query.CountAsync(cancellationToken);

        var reviews = await query
            .OrderByDescending(r => r.CreatedAt)
            .Skip((page - 1) * pageSize)
            .Take(pageSize)
            .Select(r => new
            {
                r.Id,
                r.ProductId,
                r.UserId,
                r.Rating,
                r.Title,
                r.Content,
                r.CreatedAt,
                UserName = r.User != null ? r.User.FullName : "Anonymous",
                Images = r.Images
                    .OrderBy(i => i.SortOrder)
                    .Select(i => i.ImageUrl)
                    .ToList()
            })
            .ToListAsync(cancellationToken);

        var dtoItems = reviews
            .Select(r => new ReviewDto(
                r.Id,
                r.ProductId,
                r.UserId,
                r.UserName,
                r.Rating,
                r.Title,
                r.Content,
                r.CreatedAt,
                r.Images
            ))
            .ToList();

        var totalPages = (int)Math.Ceiling(totalItems / (double)pageSize);

        var result = new PagedResult<ReviewDto>(
            dtoItems,
            page,
            pageSize,
            totalItems,
            totalPages
        );

        return Ok(result);
    }

    [Authorize(Roles = "CUSTOMER")]
    [HttpPost]
    public async Task<ActionResult<ReviewDto>> CreateReview(
        [FromBody] ReviewCreateRequest request,
        CancellationToken cancellationToken = default)
    {
        var userId = User.GetUserId();
        if (!userId.HasValue)
        {
            return Unauthorized();
        }

        if (request.Rating is < 1 or > 5)
        {
            return BadRequest("Rating must be between 1 and 5.");
        }

        if (request.Content is { Length: > 2000 })
        {
            return BadRequest("Content is too long (max 2000 characters).");
        }

        var product = await _db.Products
            .AsNoTracking()
            .FirstOrDefaultAsync(p => p.Id == request.ProductId && p.IsActive, cancellationToken);
        if (product is null)
        {
            return BadRequest("Product not found or inactive.");
        }

        var user = await _db.Users
            .AsNoTracking()
            .FirstOrDefaultAsync(u => u.Id == userId.Value, cancellationToken);
        if (user is null)
        {
            return BadRequest("User not found.");
        }

        var review = new Review
        {
            ProductId = request.ProductId,
            UserId = userId.Value,
            Rating = (byte)request.Rating,
            Title = request.Title,
            Content = request.Content,
            HasImage = request.ImageUrls is { Count: > 0 },
            IsApproved = true, // TODO: move to manual approval workflow
            CreatedAt = DateTime.UtcNow
        };

        if (request.ImageUrls is { Count: > 0 })
        {
            review.Images = request.ImageUrls
                .Select((url, index) => new ReviewImage
                {
                    ImageUrl = url,
                    SortOrder = index
                })
                .ToList();
        }

        _db.Reviews.Add(review);
        await _db.SaveChangesAsync(cancellationToken);

        var created = await _db.Reviews
            .AsNoTracking()
            .Where(r => r.Id == review.Id)
            .Select(r => new
            {
                r.Id,
                r.ProductId,
                r.UserId,
                r.Rating,
                r.Title,
                r.Content,
                r.CreatedAt,
                UserName = r.User != null ? r.User.FullName : "Anonymous",
                Images = r.Images
                    .OrderBy(i => i.SortOrder)
                    .Select(i => i.ImageUrl)
                    .ToList()
            })
            .FirstAsync(cancellationToken);

        var dto = new ReviewDto(
            created.Id,
            created.ProductId,
            created.UserId,
            created.UserName,
            created.Rating,
            created.Title,
            created.Content,
            created.CreatedAt,
            created.Images
        );

        return CreatedAtAction(nameof(GetReviews), new { productId = dto.ProductId }, dto);
    }
}
