namespace GoFoody.Api.Features.Catalog.Models;

public sealed record CategoryDto(
    int Id,
    string Name,
    string Slug,
    string? Description
);
