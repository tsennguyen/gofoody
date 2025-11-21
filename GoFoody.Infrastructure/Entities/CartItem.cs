using System;

namespace GoFoody.Infrastructure.Entities;

public partial class CartItem
{
    public long Id { get; set; }

    public Guid CartId { get; set; }

    public int ProductVariantId { get; set; }

    public int Quantity { get; set; }

    public DateTime CreatedAt { get; set; }

    public virtual Cart? Cart { get; set; }

    public virtual ProductVariant? ProductVariant { get; set; }
}
