using System;
using System.Collections.Generic;

namespace GoFoody.Infrastructure.Entities;

public partial class Cart
{
    public Guid Id { get; set; }

    public int? UserId { get; set; }

    public DateTime CreatedAt { get; set; }

    public DateTime? UpdatedAt { get; set; }

    public virtual User? User { get; set; }

    public virtual ICollection<CartItem> CartItems { get; set; } = new HashSet<CartItem>();
}
