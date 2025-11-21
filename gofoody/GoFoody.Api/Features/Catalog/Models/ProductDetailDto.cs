namespace GoFoody.Api.Features.Catalog.Models;

public sealed record ProductDetailDto(
    int Id,
    string Name,
    string Slug,
    string CategoryName,
    string? CategorySlug,
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
    decimal MinPrice,
    decimal? MaxPrice,
    IReadOnlyList<ProductVariantDto> Variants,
    IReadOnlyList<ProductImageDto> Images,
    ReviewSummaryDto ReviewSummary
);
