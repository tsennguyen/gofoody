namespace GoFoody.Api.Features.Orders.Models;

public enum OrderStatus
{
    Pending = 0,
    Confirmed = 1,
    Shipping = 2,
    Completed = 3,
    Cancelled = 4
}

public enum PaymentStatus
{
    Unpaid = 0,
    Paid = 1,
    Refunded = 2
}

public sealed record OrderListItemDto(
    long Id,
    string OrderCode,
    DateTime CreatedAt,
    decimal TotalAmount,
    OrderStatus Status,
    PaymentStatus PaymentStatus,
    string? ShippingMethodName,
    string? PaymentMethodName,
    int TotalItems,
    bool RequiresColdShipping
);

public sealed record OrderItemDto(
    long Id,
    int ProductId,
    int ProductVariantId,
    string ProductName,
    string Unit,
    int Quantity,
    decimal UnitPrice,
    decimal LineTotal
);

public sealed record OrderDetailDto(
    long Id,
    string OrderCode,
    DateTime CreatedAt,
    DateTime? UpdatedAt,
    decimal Subtotal,
    decimal ShippingFee,
    decimal TotalAmount,
    OrderStatus Status,
    PaymentStatus PaymentStatus,
    string CustomerName,
    string CustomerPhone,
    string? CustomerEmail,
    string ShippingAddress,
    string? Note,
    string? ShippingMethodName,
    string? PaymentMethodName,
    bool RequiresColdShipping,
    IReadOnlyList<OrderItemDto> Items
);

public sealed record OrderFilterRequest(
    int? UserId,
    OrderStatus? Status,
    PaymentStatus? PaymentStatus,
    DateTime? FromDate,
    DateTime? ToDate,
    string? OrderCode,
    int Page,
    int PageSize
);

public sealed record OrderStatsDto(
    int TotalOrders,
    int PendingOrders,
    int CompletedOrders,
    int CancelledOrders,
    decimal TotalRevenue,
    decimal TodayRevenue,
    decimal ThisMonthRevenue
);

public sealed record OrderStatusUpdateRequest(
    OrderStatus Status,
    PaymentStatus? PaymentStatus
);
