namespace GoFoody.Api.Features.Cart.Models;

public sealed record CartItemDto(
    long Id,
    int ProductId,
    int ProductVariantId,
    string ProductName,
    string VariantName,
    string Unit,
    decimal UnitPrice,
    int Quantity,
    decimal LineTotal,
    bool RequiresColdShipping,
    int StockQuantity,
    int MinOrderQuantity,
    int? MaxOrderQuantity,
    string? ThumbnailUrl
);

public sealed record CartSummaryDto(
    Guid CartId,
    IReadOnlyList<CartItemDto> Items,
    decimal Subtotal,
    bool RequiresColdShipping,
    int TotalQuantity
);

public sealed record CartItemAddRequest(
    int ProductVariantId,
    int Quantity
);

public sealed record CartItemUpdateRequest(
    int Quantity
);
