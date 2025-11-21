namespace GoFoody.Api.Features.Orders.Models;

public sealed record ShippingMethodDto(
    int Id,
    string Code,
    string Name,
    string? Description,
    bool IsColdShipping,
    decimal BaseFee
);

public sealed record PaymentMethodDto(
    int Id,
    string Code,
    string Name,
    string? Description
);

public sealed record CheckoutRequest(
    string FullName,
    string Phone,
    string AddressLine,
    string? Ward,
    string? District,
    string? City,
    int ShippingMethodId,
    int PaymentMethodId,
    string? Note
);

public sealed record OrderCreatedDto(
    long OrderId,
    string OrderCode,
    decimal Subtotal,
    decimal ShippingFee,
    decimal TotalAmount,
    bool RequiresColdShipping,
    DateTime CreatedAt
);
