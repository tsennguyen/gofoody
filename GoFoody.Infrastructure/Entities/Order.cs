using System;
using System.Collections.Generic;

namespace GoFoody.Infrastructure.Entities;

public partial class Order
{
    public long Id { get; set; }

    public string OrderCode { get; set; } = string.Empty;

    public int? UserId { get; set; }

    public string CustomerName { get; set; } = string.Empty;

    public string CustomerPhone { get; set; } = string.Empty;

    public string? CustomerEmail { get; set; }

    public string ShippingAddressText { get; set; } = string.Empty;

    public int ShippingMethodId { get; set; }

    public int PaymentMethodId { get; set; }

    public DateTime? DeliverySlotFrom { get; set; }

    public DateTime? DeliverySlotTo { get; set; }

    public decimal Subtotal { get; set; }

    public decimal ShippingFee { get; set; }

    public decimal DiscountAmount { get; set; }

    public decimal TotalAmount { get; set; }

    public bool RequiresColdShipping { get; set; }

    public byte Status { get; set; }

    public byte PaymentStatus { get; set; }

    public string? TrackingCode { get; set; }

    public DateTime CreatedAt { get; set; }

    public DateTime? UpdatedAt { get; set; }

    public string? Note { get; set; }

    public virtual User? User { get; set; }

    public virtual ShippingMethod? ShippingMethod { get; set; }

    public virtual PaymentMethod? PaymentMethod { get; set; }

    public virtual ICollection<OrderItem> OrderItems { get; set; } = new HashSet<OrderItem>();
}
