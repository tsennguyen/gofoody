namespace GoFoody.Infrastructure.Entities;

public partial class ProductVariant
{
    public int Id { get; set; }

    public int ProductId { get; set; }

    public string Sku { get; set; } = string.Empty;

    public string Name { get; set; } = string.Empty;

    public string Unit { get; set; } = string.Empty;

    public int? WeightGrams { get; set; }

    public decimal Price { get; set; }

    public decimal? ListPrice { get; set; }

    public bool IsFresh { get; set; }

    public bool IsFrozen { get; set; }

    public bool IsPrecut { get; set; }

    public bool RequireColdShipping { get; set; }

    public int StockQuantity { get; set; }

    public byte Status { get; set; }

    public int MinOrderQuantity { get; set; }

    public int? MaxOrderQuantity { get; set; }

    public virtual Product? Product { get; set; }

    public virtual ICollection<CartItem> CartItems { get; set; } = new HashSet<CartItem>();

    public virtual ICollection<OrderItem> OrderItems { get; set; } = new HashSet<OrderItem>();
}
