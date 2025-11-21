using GoFoody.Api.Features.Admin.Categories;
using GoFoody.Api.Features.Catalog.Models;
using GoFoody.Infrastructure.Data;
using GoFoody.Infrastructure.Entities;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace GoFoody.Api.Features.Admin.Categories;

[ApiController]
[Route("api/admin/categories")]
[Authorize(Roles = "ADMIN")]
public sealed class AdminCategoriesController : ControllerBase
{
    private readonly GoFoodyDbContext _db;

    public AdminCategoriesController(GoFoodyDbContext db)
    {
        _db = db;
    }

    [HttpGet]
    public async Task<ActionResult<PagedResult<CategoryAdminListItemDto>>> GetList(
        [FromQuery] int page = 1,
        [FromQuery] int pageSize = 20,
        [FromQuery] string? keyword = null,
        [FromQuery] bool? isActive = null,
        CancellationToken cancellationToken = default)
    {
        page = page < 1 ? 1 : page;
        pageSize = Math.Clamp(pageSize, 1, 100);

        var query = _db.Categories.AsNoTracking().AsQueryable();
        if (!string.IsNullOrWhiteSpace(keyword))
        {
            var kw = keyword.Trim().ToLower();
            query = query.Where(c => c.Name.ToLower().Contains(kw) || c.Slug.ToLower().Contains(kw));
        }
        if (isActive.HasValue)
        {
            query = query.Where(c => c.IsActive == isActive.Value);
        }

        var totalItems = await query.CountAsync(cancellationToken);

        var items = await query
            .OrderBy(c => c.SortOrder)
            .ThenBy(c => c.Name)
            .Skip((page - 1) * pageSize)
            .Take(pageSize)
            .Select(c => new CategoryAdminListItemDto(
                c.Id,
                c.Name,
                c.Slug,
                c.IsActive,
                c.SortOrder,
                c.Products.Count(p => p.IsActive)))
            .ToListAsync(cancellationToken);

        var totalPages = (int)Math.Ceiling(totalItems / (double)pageSize);
        return Ok(new PagedResult<CategoryAdminListItemDto>(items, page, pageSize, totalItems, totalPages));
    }

    [HttpGet("{id:int}")]
    public async Task<ActionResult<CategoryAdminDetailDto>> GetDetail(int id, CancellationToken cancellationToken)
    {
        var category = await _db.Categories
            .AsNoTracking()
            .Where(c => c.Id == id)
            .Select(c => new CategoryAdminDetailDto(
                c.Id,
                c.Name,
                c.Slug,
                c.Description,
                c.ParentId,
                c.IsActive,
                c.SortOrder))
            .FirstOrDefaultAsync(cancellationToken);

        return category is null ? NotFound() : Ok(category);
    }

    [HttpPost]
    public async Task<ActionResult<CategoryAdminDetailDto>> Create(
        [FromBody] CategoryAdminUpsertRequest request,
        CancellationToken cancellationToken)
    {
        if (string.IsNullOrWhiteSpace(request.Name))
        {
            return BadRequest("Name is required.");
        }

        var slug = string.IsNullOrWhiteSpace(request.Slug) ? Slugify(request.Name) : Slugify(request.Slug);
        var exists = await _db.Categories.AnyAsync(c => c.Slug == slug, cancellationToken);
        if (exists) return BadRequest("Slug already exists.");

        var entity = new Category
        {
            Name = request.Name,
            Slug = slug,
            Description = request.Description,
            ParentId = request.ParentId,
            IsActive = request.IsActive,
            SortOrder = request.SortOrder ?? 0
        };

        _db.Categories.Add(entity);
        await _db.SaveChangesAsync(cancellationToken);

        var detail = new CategoryAdminDetailDto(
            entity.Id,
            entity.Name,
            entity.Slug,
            entity.Description,
            entity.ParentId,
            entity.IsActive,
            entity.SortOrder);

        return CreatedAtAction(nameof(GetDetail), new { id = entity.Id }, detail);
    }

    [HttpPut("{id:int}")]
    public async Task<ActionResult<CategoryAdminDetailDto>> Update(
        int id,
        [FromBody] CategoryAdminUpsertRequest request,
        CancellationToken cancellationToken)
    {
        var category = await _db.Categories.FirstOrDefaultAsync(c => c.Id == id, cancellationToken);
        if (category is null) return NotFound();

        if (string.IsNullOrWhiteSpace(request.Name))
        {
            return BadRequest("Name is required.");
        }

        var slug = string.IsNullOrWhiteSpace(request.Slug) ? Slugify(request.Name) : Slugify(request.Slug);
        var exists = await _db.Categories.AnyAsync(c => c.Slug == slug && c.Id != id, cancellationToken);
        if (exists) return BadRequest("Slug already exists.");

        category.Name = request.Name;
        category.Slug = slug;
        category.Description = request.Description;
        category.ParentId = request.ParentId;
        category.IsActive = request.IsActive;
        if (request.SortOrder.HasValue)
        {
            category.SortOrder = request.SortOrder.Value;
        }

        await _db.SaveChangesAsync(cancellationToken);

        var detail = new CategoryAdminDetailDto(
            category.Id,
            category.Name,
            category.Slug,
            category.Description,
            category.ParentId,
            category.IsActive,
            category.SortOrder);

        return Ok(detail);
    }

    [HttpDelete("{id:int}")]
    public async Task<IActionResult> Delete(int id, CancellationToken cancellationToken)
    {
        var category = await _db.Categories.FirstOrDefaultAsync(c => c.Id == id, cancellationToken);
        if (category is null) return NotFound();

        category.IsActive = false;
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
