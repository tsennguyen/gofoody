using System.Security.Claims;
using GoFoody.Api.Features.Auth.Models;
using GoFoody.Infrastructure.Data;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace GoFoody.Api.Features.Auth;

[ApiController]
[Route("api/[controller]")]
public sealed class AccountController : ControllerBase
{
    private readonly GoFoodyDbContext _db;

    public AccountController(GoFoodyDbContext db)
    {
        _db = db;
    }

    [Authorize]
    [HttpGet("me")]
    public async Task<ActionResult<CurrentUserDto>> GetMe(CancellationToken cancellationToken)
    {
        var userIdClaim = User.FindFirst(ClaimTypes.NameIdentifier) ?? User.FindFirst(JwtClaimTypes.Sub);
        if (userIdClaim is null || !int.TryParse(userIdClaim.Value, out var userId))
        {
            return Unauthorized();
        }

        var user = await _db.Users
            .AsNoTracking()
            .Where(u => u.Id == userId && u.Status == 1)
            .Select(u => new
            {
                u.Id,
                u.FullName,
                u.Email,
                u.Phone,
                Roles = u.UserRoles.Select(ur => ur.Role!.Code).ToList()
            })
            .FirstOrDefaultAsync(cancellationToken);

        if (user is null)
        {
            return Unauthorized();
        }

        var dto = new CurrentUserDto(
            user.Id,
            user.FullName,
            user.Email,
            user.Phone,
            user.Roles
        );

        return Ok(dto);
    }
}

internal static class JwtClaimTypes
{
    public const string Sub = "sub";
}
