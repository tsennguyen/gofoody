namespace GoFoody.Api.Features.Catalog.Models;

public sealed record ReviewSummaryDto(
    double AverageRating,
    int TotalReviews
);
