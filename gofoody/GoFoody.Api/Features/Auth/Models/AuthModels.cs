namespace GoFoody.Api.Features.Auth.Models;

public sealed record RegisterRequest(
    string FullName,
    string Email,
    string Password,
    string? Phone
);

public sealed record LoginRequest(
    string EmailOrPhone,
    string Password
);

public sealed record AuthUserDto(
    int Id,
    string FullName,
    string Email,
    string? Phone,
    IReadOnlyList<string> Roles
);

public sealed record AuthResponse(
    string Token,
    DateTime ExpiresAt,
    AuthUserDto User
);

public sealed record CurrentUserDto(
    int Id,
    string FullName,
    string Email,
    string? Phone,
    IReadOnlyList<string> Roles
);

public sealed record UserWithRoles(
    int Id,
    string FullName,
    string Email,
    string? Phone,
    IReadOnlyList<string> Roles
);
