using System;
using System.Collections.Generic;

namespace GoFoody.Infrastructure.Entities;

public partial class User
{
    public int Id { get; set; }

    public string Email { get; set; } = string.Empty;

    public string? Phone { get; set; }

    public string PasswordHash { get; set; } = string.Empty;

    public string FullName { get; set; } = string.Empty;

    public bool IsEmailConfirmed { get; set; }

    public bool IsPhoneConfirmed { get; set; }

    public byte Status { get; set; }

    public DateTime CreatedAt { get; set; }

    public DateTime? LastLoginAt { get; set; }

    public virtual ICollection<Review> Reviews { get; set; } = new HashSet<Review>();

    public virtual ICollection<UserRole> UserRoles { get; set; } = new HashSet<UserRole>();

    public virtual ICollection<Cart> Carts { get; set; } = new HashSet<Cart>();

    public virtual ICollection<Order> Orders { get; set; } = new HashSet<Order>();
}
