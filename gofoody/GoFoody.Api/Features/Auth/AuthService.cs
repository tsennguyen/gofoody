using System.IdentityModel.Tokens.Jwt;
using System.Security.Claims;
using System.Text;
using GoFoody.Api.Features.Auth.Models;
using GoFoody.Infrastructure.Data;
using GoFoody.Infrastructure.Entities;
using Microsoft.AspNetCore.Identity;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Configuration;
using Microsoft.IdentityModel.Tokens;

namespace GoFoody.Api.Features.Auth;

public sealed class AuthService : IAuthService
{
    private readonly GoFoodyDbContext _db;
    private readonly IConfiguration _configuration;
    private readonly PasswordHasher<User> _passwordHasher = new();

    public AuthService(GoFoodyDbContext db, IConfiguration configuration)
    {
        _db = db;
        _configuration = configuration;
    }

    public async Task<AuthResponse> RegisterAsync(RegisterRequest request, CancellationToken cancellationToken = default)
    {
        if (string.IsNullOrWhiteSpace(request.Email))
        {
            throw new InvalidOperationException("Email is required.");
        }

        var emailNormalized = request.Email.Trim().ToLowerInvariant();

        var existing = await _db.Users.AsNoTracking()
            .FirstOrDefaultAsync(u => u.Email.ToLower() == emailNormalized || (u.Phone != null && u.Phone == request.Phone), cancellationToken);

        if (existing is not null)
        {
            throw new InvalidOperationException("Email or phone already exists.");
        }

        var user = new User
        {
            FullName = request.FullName,
            Email = emailNormalized,
            Phone = request.Phone,
            Status = 1,
            IsEmailConfirmed = false,
            IsPhoneConfirmed = false,
            CreatedAt = DateTime.UtcNow,
        };
        user.PasswordHash = _passwordHasher.HashPassword(user, request.Password);

        var customerRole = await _db.Roles.AsNoTracking()
            .Where(r => r.Code == "CUSTOMER")
            .Select(r => new { r.Id })
            .FirstOrDefaultAsync(cancellationToken);

        if (customerRole is null)
        {
            throw new InvalidOperationException("Default role CUSTOMER is missing.");
        }

        user.UserRoles.Add(new UserRole { RoleId = customerRole.Id });

        _db.Users.Add(user);
        await _db.SaveChangesAsync(cancellationToken);

        var roles = new List<string> { "CUSTOMER" };
        var userWithRoles = new UserWithRoles(user.Id, user.FullName, user.Email, user.Phone, roles);
        var token = GenerateJwtToken(userWithRoles);

        var jwtSection = _configuration.GetSection("Jwt");
        var expiresMinutes = int.TryParse(jwtSection["ExpiresMinutes"], out var e) ? e : 120;

        return new AuthResponse(
            token,
            DateTime.UtcNow.AddMinutes(expiresMinutes),
            new AuthUserDto(user.Id, user.FullName, user.Email, user.Phone, roles));
    }

    public async Task<AuthResponse> LoginAsync(LoginRequest request, CancellationToken cancellationToken = default)
    {
        var keyword = request.EmailOrPhone.Trim().ToLowerInvariant();

        var user = await _db.Users
            .Include(u => u.UserRoles)
            .ThenInclude(ur => ur.Role)
            .FirstOrDefaultAsync(u =>
                u.Status == 1 &&
                (u.Email.ToLower() == keyword || (u.Phone != null && u.Phone.ToLower() == keyword)),
                cancellationToken);

        if (user is null)
        {
            throw new UnauthorizedAccessException("Invalid credentials.");
        }

        var verification = _passwordHasher.VerifyHashedPassword(user, user.PasswordHash, request.Password);
        if (verification == PasswordVerificationResult.Failed)
        {
            throw new UnauthorizedAccessException("Invalid credentials.");
        }

        var roles = user.UserRoles.Select(ur => ur.Role?.Code ?? string.Empty).Where(r => !string.IsNullOrWhiteSpace(r)).ToList();

        var userWithRoles = new UserWithRoles(user.Id, user.FullName, user.Email, user.Phone, roles);
        var token = GenerateJwtToken(userWithRoles);

        var jwtSection = _configuration.GetSection("Jwt");
        var expiresMinutes = int.TryParse(jwtSection["ExpiresMinutes"], out var e) ? e : 120;

        return new AuthResponse(
            token,
            DateTime.UtcNow.AddMinutes(expiresMinutes),
            new AuthUserDto(user.Id, user.FullName, user.Email, user.Phone, roles));
    }

    public string GenerateJwtToken(UserWithRoles user)
    {
        var jwtSection = _configuration.GetSection("Jwt");
        var key = jwtSection["Key"] ?? throw new InvalidOperationException("Jwt:Key missing");
        var issuer = jwtSection["Issuer"];
        var audience = jwtSection["Audience"];
        var expiresMinutes = int.TryParse(jwtSection["ExpiresMinutes"], out var e) ? e : 120;

        var claims = new List<Claim>
        {
            new(JwtRegisteredClaimNames.Sub, user.Id.ToString()),
            new(ClaimTypes.NameIdentifier, user.Id.ToString()),
            new(JwtRegisteredClaimNames.Name, user.FullName),
            new(JwtRegisteredClaimNames.Email, user.Email)
        };

        foreach (var role in user.Roles.Distinct(StringComparer.OrdinalIgnoreCase))
        {
            claims.Add(new Claim(ClaimTypes.Role, role));
        }

        var signingKey = new SymmetricSecurityKey(Encoding.UTF8.GetBytes(key));
        var creds = new SigningCredentials(signingKey, SecurityAlgorithms.HmacSha256);

        var token = new JwtSecurityToken(
            issuer: issuer,
            audience: audience,
            claims: claims,
            expires: DateTime.UtcNow.AddMinutes(expiresMinutes),
            signingCredentials: creds);

        return new JwtSecurityTokenHandler().WriteToken(token);
    }
}
