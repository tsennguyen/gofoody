using System.Collections.Generic;

namespace GoFoody.Infrastructure.Entities;

public partial class PaymentMethod
{
    public int Id { get; set; }

    public string Code { get; set; } = string.Empty;

    public string Name { get; set; } = string.Empty;

    public string? Description { get; set; }

    public bool IsActive { get; set; }

    public virtual ICollection<Order> Orders { get; set; } = new HashSet<Order>();
}
