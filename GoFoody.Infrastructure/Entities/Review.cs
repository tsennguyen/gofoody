using System;
using System.Collections.Generic;

namespace GoFoody.Infrastructure.Entities;

public partial class Review
{
    public long Id { get; set; }

    public int ProductId { get; set; }

    public int UserId { get; set; }

    public long? OrderId { get; set; }

    public byte Rating { get; set; }

    public string? Title { get; set; }

    public string? Content { get; set; }

    public bool HasImage { get; set; }

    public bool IsApproved { get; set; }

    public DateTime CreatedAt { get; set; }

    public virtual Product? Product { get; set; }

    public virtual User? User { get; set; }

    public virtual ICollection<ReviewImage> Images { get; set; } = new HashSet<ReviewImage>();
}
