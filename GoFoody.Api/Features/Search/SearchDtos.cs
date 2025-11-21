namespace GoFoody.Api.Features.Search;

public sealed record ProductSearchFilterRequest(
    string? Query,
    int? CategoryId,
    decimal? MinPrice,
    decimal? MaxPrice,
    IReadOnlyList<string>? DietTags,
    IReadOnlyList<string>? IngredientTags,
    string? SortBy,
    int Page = 1,
    int PageSize = 12
);

public sealed record ProductSearchResultItemDto(
    int ProductId,
    string Name,
    string Slug,
    string CategoryName,
    string? ShortDescription,
    decimal MinPrice,
    decimal? MaxPrice,
    bool RequiresColdShipping,
    IReadOnlyList<string> DietTags,
    IReadOnlyList<string> IngredientTags
);

public sealed record ProductSearchResponse(
    int Page,
    int PageSize,
    int TotalItems,
    int TotalPages,
    IReadOnlyList<ProductSearchResultItemDto> Items,
    IReadOnlyList<string> SuggestedTerms
);

public sealed record SearchSuggestionDto(
    string Term,
    string Type,
    int? ProductId,
    int? CategoryId
);

public sealed record ProductRecommendationItemDto(
    int ProductId,
    string Name,
    string Slug,
    string CategoryName,
    decimal MinPrice,
    decimal? MaxPrice,
    string Reason
);

public sealed record ProductRecommendationsResponse(
    IReadOnlyList<ProductRecommendationItemDto> Items
);
