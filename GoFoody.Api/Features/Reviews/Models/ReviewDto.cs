namespace GoFoody.Api.Features.Reviews.Models;

public sealed record ReviewDto(
    long Id,
    int ProductId,
    int UserId,
    string UserName,
    int Rating,
    string? Title,
    string? Content,
    DateTime CreatedAt,
    IReadOnlyList<string> ImageUrls
);
