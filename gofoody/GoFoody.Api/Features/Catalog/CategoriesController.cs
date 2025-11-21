using GoFoody.Api.Features.Catalog.Models;
using GoFoody.Infrastructure.Data;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace GoFoody.Api.Features.Catalog;

[ApiController]
[Route("api/[controller]")]
public class CategoriesController : ControllerBase
{
    private readonly GoFoodyDbContext _dbContext;

    public CategoriesController(GoFoodyDbContext dbContext)
    {
        _dbContext = dbContext;
    }

    [HttpGet]
    public async Task<ActionResult<IEnumerable<CategoryDto>>> GetCategories(
        [FromQuery] bool? includeInactive,
        CancellationToken cancellationToken)
    {
        // Trả về toàn bộ danh mục (không chỉ top-level), sắp xếp SortOrder rồi Name.
        var query = _dbContext.Categories.AsNoTracking();
        if (includeInactive is not true)
        {
            query = query.Where(c => c.IsActive);
        }

        var categories = await query
            .OrderBy(c => c.SortOrder)
            .ThenBy(c => c.Name)
            .Select(c => new CategoryDto(c.Id, c.Name, c.Slug, c.Description))
            .ToListAsync(cancellationToken);

        return Ok(categories);
    }

    [HttpGet("{slug}")]
    public async Task<ActionResult<CategoryDto>> GetBySlug(string slug, CancellationToken cancellationToken)
    {
        var normalized = slug.Trim().ToLower();

        var category = await _dbContext.Categories
            .AsNoTracking()
            .Where(c => c.Slug.ToLower() == normalized)
            .Select(c => new CategoryDto(c.Id, c.Name, c.Slug, c.Description))
            .FirstOrDefaultAsync(cancellationToken);

        if (category is null)
        {
            return NotFound();
        }

        return Ok(category);
    }
}
