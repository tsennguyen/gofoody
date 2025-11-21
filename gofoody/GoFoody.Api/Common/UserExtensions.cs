using System.Security.Claims;

namespace GoFoody.Api.Common;

public static class UserExtensions
{
    public static int? GetUserId(this ClaimsPrincipal user)
    {
        var claim = user.FindFirst(ClaimTypes.NameIdentifier) ?? user.FindFirst("sub");
        if (claim is null) return null;
        return int.TryParse(claim.Value, out var id) ? id : null;
    }
}
