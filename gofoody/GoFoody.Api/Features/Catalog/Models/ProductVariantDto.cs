namespace GoFoody.Api.Features.Catalog.Models;

public sealed record ProductVariantDto(
    int Id,
    string Name,
    string Unit,
    int? WeightGrams,
    decimal Price,
    decimal? ListPrice,
    bool IsFresh,
    bool IsFrozen,
    bool IsPrecut,
    bool RequiresColdShipping,
    int StockQuantity,
    int MinOrderQuantity,
    int? MaxOrderQuantity
);
