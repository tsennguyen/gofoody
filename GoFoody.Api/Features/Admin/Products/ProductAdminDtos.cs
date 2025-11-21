namespace GoFoody.Api.Features.Admin.Products;

public sealed record ProductVariantAdminDto(
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
    int? MaxOrderQuantity,
    bool IsActive
);

public sealed record ProductImageAdminDto(
    int Id,
    string ImageUrl,
    bool IsDefault,
    int SortOrder
);

public sealed record ProductAdminListItemDto(
    int Id,
    string Name,
    string Slug,
    string CategoryName,
    bool IsActive,
    decimal MinPrice,
    decimal? MaxPrice,
    int TotalStock,
    bool RequiresColdShipping,
    DateTime CreatedAt
);

public sealed record ProductAdminDetailDto(
    int Id,
    string Name,
    string Slug,
    int CategoryId,
    string CategoryName,
    string? ShortDescription,
    string? Description,
    string? OriginCountry,
    string? Brand,
    bool IsOrganic,
    bool HasHaccpCert,
    bool IsSeasonal,
    string? StorageCondition,
    decimal? StorageTempMin,
    decimal? StorageTempMax,
    bool IsActive,
    IReadOnlyList<ProductVariantAdminDto> Variants,
    IReadOnlyList<ProductImageAdminDto> Images
);

public sealed record ProductVariantAdminUpsertRequest(
    int? Id,
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
    int? MaxOrderQuantity,
    bool IsActive
);

public sealed record ProductImageAdminUpsertRequest(
    int? Id,
    string ImageUrl,
    bool IsDefault,
    int SortOrder
);

public sealed record ProductAdminUpsertRequest(
    string Name,
    string? Slug,
    int CategoryId,
    string? ShortDescription,
    string? Description,
    string? OriginCountry,
    string? Brand,
    bool IsOrganic,
    bool HasHaccpCert,
    bool IsSeasonal,
    string? StorageCondition,
    decimal? StorageTempMin,
    decimal? StorageTempMax,
    bool IsActive,
    IReadOnlyList<ProductVariantAdminUpsertRequest> Variants,
    IReadOnlyList<ProductImageAdminUpsertRequest> Images
);
