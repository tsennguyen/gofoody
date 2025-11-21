namespace GoFoody.Api.Features.Catalog.Models;

public sealed record ProductListItemDto(
    int Id,
    string Name,
    string Slug,
    string CategoryName,
    decimal MinPrice,
    decimal? MaxPrice,
    bool IsOrganic,
    bool HasHaccpCert,
    bool IsSeasonal,
    bool RequiresColdShipping,
    string? ThumbnailUrl
);
