using System;
using System.Collections.Generic;

namespace GoFoody.Infrastructure.Entities;

public partial class Tag
{
    public int Id { get; set; }

    public string Name { get; set; } = string.Empty;

    public string Slug { get; set; } = string.Empty;

    public string TagType { get; set; } = string.Empty;

    public bool IsActive { get; set; }

    public virtual ICollection<ProductTag> ProductTags { get; set; } = new HashSet<ProductTag>();
}
