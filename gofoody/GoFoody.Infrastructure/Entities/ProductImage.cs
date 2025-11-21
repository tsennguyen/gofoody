namespace GoFoody.Infrastructure.Entities;

public partial class ProductImage
{
    public int Id { get; set; }

    public int ProductId { get; set; }

    public string ImageUrl { get; set; } = string.Empty;

    public bool IsDefault { get; set; }

    public int SortOrder { get; set; }

    public virtual Product? Product { get; set; }
}
