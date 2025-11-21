using GoFoody.Api.Features.Admin.Users;
using GoFoody.Api.Features.Catalog.Models;
using GoFoody.Infrastructure.Data;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace GoFoody.Api.Features.Admin.Users;

[ApiController]
[Route("api/admin/users")]
[Authorize(Roles = "ADMIN")]
public sealed class AdminUsersController : ControllerBase
{
    private readonly GoFoodyDbContext _db;

    public AdminUsersController(GoFoodyDbContext db)
    {
        _db = db;
    }

    [HttpGet]
    public async Task<ActionResult<PagedResult<UserAdminListItemDto>>> GetUsers(
        [FromQuery] int page = 1,
        [FromQuery] int pageSize = 20,
        [FromQuery] string? keyword = null,
        [FromQuery] string? role = null,
        [FromQuery] bool? isActive = null,
        CancellationToken cancellationToken = default)
    {
        page = page < 1 ? 1 : page;
        pageSize = Math.Clamp(pageSize, 1, 100);

        var query = _db.Users
            .AsNoTracking()
            .Include(u => u.UserRoles)
            .ThenInclude(ur => ur.Role)
            .AsQueryable();

        if (!string.IsNullOrWhiteSpace(keyword))
        {
            var kw = keyword.Trim().ToLower();
            query = query.Where(u =>
                u.FullName.ToLower().Contains(kw) ||
                u.Email.ToLower().Contains(kw) ||
                (u.Phone != null && u.Phone.ToLower().Contains(kw)));
        }

        if (!string.IsNullOrWhiteSpace(role))
        {
            var r = role.Trim().ToUpperInvariant();
            query = query.Where(u => u.UserRoles.Any(ur => ur.Role != null && ur.Role.Code == r));
        }

        if (isActive.HasValue)
        {
            query = query.Where(u => (u.Status == 1) == isActive.Value);
        }

        var totalItems = await query.CountAsync(cancellationToken);

        var items = await query
            .OrderByDescending(u => u.CreatedAt)
            .Skip((page - 1) * pageSize)
            .Take(pageSize)
            .Select(u => new UserAdminListItemDto(
                u.Id,
                u.FullName,
                u.Email,
                u.Phone,
                u.Status == 1,
                u.UserRoles.Select(ur => ur.Role!.Code).ToList(),
                u.CreatedAt))
            .ToListAsync(cancellationToken);

        var totalPages = (int)Math.Ceiling(totalItems / (double)pageSize);

        return Ok(new PagedResult<UserAdminListItemDto>(items, page, pageSize, totalItems, totalPages));
    }

    [HttpGet("{id:int}")]
    public async Task<ActionResult<UserAdminDetailDto>> GetDetail(int id, CancellationToken cancellationToken)
    {
        var user = await _db.Users
            .AsNoTracking()
            .Where(u => u.Id == id)
            .Select(u => new UserAdminDetailDto(
                u.Id,
                u.FullName,
                u.Email,
                u.Phone,
                u.Status == 1,
                u.UserRoles.Select(ur => ur.Role!.Code).ToList(),
                u.CreatedAt))
            .FirstOrDefaultAsync(cancellationToken);

        return user is null ? NotFound() : Ok(user);
    }

    [HttpPut("{id:int}")]
    public async Task<ActionResult<UserAdminDetailDto>> Update(
        int id,
        [FromBody] UserAdminUpdateRequest request,
        CancellationToken cancellationToken)
    {
        var user = await _db.Users
            .Include(u => u.UserRoles)
            .FirstOrDefaultAsync(u => u.Id == id, cancellationToken);
        if (user is null) return NotFound();

        user.FullName = request.FullName;
        user.Phone = request.Phone;
        user.Status = (byte)(request.IsActive ? 1 : 0);

        var targetRoleCodes = request.RoleCodes
            .Select(r => r.Trim().ToUpperInvariant())
            .Where(r => !string.IsNullOrWhiteSpace(r))
            .ToHashSet();

        var targetRoles = await _db.Roles
            .Where(r => targetRoleCodes.Contains(r.Code))
            .ToListAsync(cancellationToken);
        var targetRoleIds = targetRoles.Select(r => r.Id).ToHashSet();

        // remove roles not in target
        user.UserRoles = user.UserRoles.Where(ur => targetRoleIds.Contains(ur.RoleId)).ToList();
        // add missing roles
        foreach (var rid in targetRoleIds)
        {
            if (!user.UserRoles.Any(ur => ur.RoleId == rid))
            {
                user.UserRoles.Add(new Infrastructure.Entities.UserRole { RoleId = rid, UserId = user.Id });
            }
        }

        await _db.SaveChangesAsync(cancellationToken);

        return await GetDetail(id, cancellationToken);
    }
}
