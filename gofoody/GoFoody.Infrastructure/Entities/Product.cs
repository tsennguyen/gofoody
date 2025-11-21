using System;
using System.Collections.Generic;

namespace GoFoody.Infrastructure.Entities;

public partial class Product
{
    public int Id { get; set; }

    public int CategoryId { get; set; }

    public string Name { get; set; } = string.Empty;

    public string Slug { get; set; } = string.Empty;

    public string? ShortDescription { get; set; }

    public string? Description { get; set; }

    public string? OriginCountry { get; set; }

    public string? Brand { get; set; }

    public int? CookingTimeMinutes { get; set; }

    public bool IsOrganic { get; set; }

    public bool HasHaccpCert { get; set; }

    public bool IsSeasonal { get; set; }

    public string? StorageCondition { get; set; }

    public decimal? StorageTempMin { get; set; }

    public decimal? StorageTempMax { get; set; }

    public DateTime CreatedAt { get; set; }

    public DateTime? UpdatedAt { get; set; }

    public bool IsActive { get; set; }

    public virtual Category? Category { get; set; }

    public virtual ICollection<ProductImage> ProductImages { get; set; } = new HashSet<ProductImage>();

    public virtual ICollection<ProductVariant> ProductVariants { get; set; } = new HashSet<ProductVariant>();

    public virtual ICollection<Review> Reviews { get; set; } = new HashSet<Review>();

    public virtual ICollection<OrderItem> OrderItems { get; set; } = new HashSet<OrderItem>();

    public virtual ICollection<ProductTag> ProductTags { get; set; } = new HashSet<ProductTag>();
}
