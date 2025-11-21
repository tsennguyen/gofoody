namespace GoFoody.Api.Features.Admin.Categories;

public sealed record CategoryAdminListItemDto(
    int Id,
    string Name,
    string Slug,
    bool IsActive,
    int SortOrder,
    int ProductCount
);

public sealed record CategoryAdminDetailDto(
    int Id,
    string Name,
    string Slug,
    string? Description,
    int? ParentId,
    bool IsActive,
    int SortOrder
);

public sealed record CategoryAdminUpsertRequest(
    string Name,
    string? Slug,
    string? Description,
    int? ParentId,
    bool IsActive,
    int? SortOrder
);
