namespace GoFoody.Api.Features.Catalog.Models;

public sealed record ProductImageDto(
    int Id,
    string ImageUrl,
    bool IsDefault,
    int SortOrder
);
