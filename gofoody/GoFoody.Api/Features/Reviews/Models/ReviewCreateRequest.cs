namespace GoFoody.Api.Features.Reviews.Models;

public sealed record ReviewCreateRequest(
    int ProductId,
    int Rating,
    string? Title,
    string? Content,
    IReadOnlyList<string>? ImageUrls
);
