using GoFoody.Api.Features.Auth.Models;

namespace GoFoody.Api.Features.Auth;

public interface IAuthService
{
    Task<AuthResponse> RegisterAsync(RegisterRequest request, CancellationToken cancellationToken = default);
    Task<AuthResponse> LoginAsync(LoginRequest request, CancellationToken cancellationToken = default);
    string GenerateJwtToken(UserWithRoles user);
}
