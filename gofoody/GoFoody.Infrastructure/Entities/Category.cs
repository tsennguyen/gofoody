using System.Collections.Generic;

namespace GoFoody.Infrastructure.Entities;

public partial class Category
{
    public int Id { get; set; }

    public int? ParentId { get; set; }

    public string Name { get; set; } = string.Empty;

    public string Slug { get; set; } = string.Empty;

    public string? Description { get; set; }

    public bool IsActive { get; set; }

    public int SortOrder { get; set; }

    public virtual Category? Parent { get; set; }

    public virtual ICollection<Category> Children { get; set; } = new HashSet<Category>();

    public virtual ICollection<Product> Products { get; set; } = new HashSet<Product>();
}
