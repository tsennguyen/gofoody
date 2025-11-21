namespace GoFoody.Api.Features.Admin.Users;

public sealed record UserAdminListItemDto(
    int Id,
    string FullName,
    string Email,
    string? Phone,
    bool IsActive,
    IReadOnlyList<string> Roles,
    DateTime CreatedAt
);

public sealed record UserAdminDetailDto(
    int Id,
    string FullName,
    string Email,
    string? Phone,
    bool IsActive,
    IReadOnlyList<string> Roles,
    DateTime CreatedAt
);

public sealed record UserAdminUpdateRequest(
    string FullName,
    string? Phone,
    bool IsActive,
    IReadOnlyList<string> RoleCodes
);
