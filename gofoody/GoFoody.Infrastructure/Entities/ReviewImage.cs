namespace GoFoody.Infrastructure.Entities;

public partial class ReviewImage
{
    public long Id { get; set; }

    public long ReviewId { get; set; }

    public string ImageUrl { get; set; } = string.Empty;

    public int SortOrder { get; set; }

    public virtual Review? Review { get; set; }
}
