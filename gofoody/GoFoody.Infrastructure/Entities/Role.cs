using System.Collections.Generic;

namespace GoFoody.Infrastructure.Entities;

public partial class Role
{
    public int Id { get; set; }

    public string Code { get; set; } = string.Empty;

    public string Name { get; set; } = string.Empty;

    public virtual ICollection<UserRole> UserRoles { get; set; } = new HashSet<UserRole>();
}
