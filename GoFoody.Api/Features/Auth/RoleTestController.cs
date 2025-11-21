using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace GoFoody.Api.Features.Auth;

[ApiController]
[Route("api")]
public sealed class RoleTestController : ControllerBase
{
    [Authorize(Roles = "ADMIN")]
    [HttpGet("admin/test")]
    public IActionResult AdminOnly() => Ok("Admin endpoint OK");

    [Authorize(Roles = "CUSTOMER")]
    [HttpGet("customer/test")]
    public IActionResult CustomerOnly() => Ok("Customer endpoint OK");
}
