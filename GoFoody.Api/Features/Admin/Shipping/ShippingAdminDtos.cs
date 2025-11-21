namespace GoFoody.Api.Features.Admin.Shipping;

public sealed record ShippingMethodAdminDto(
    int Id,
    string Code,
    string Name,
    string? Description,
    bool IsColdShipping,
    decimal BaseFee,
    bool IsActive
);

public sealed record ShippingMethodAdminUpsertRequest(
    string Code,
    string Name,
    string? Description,
    bool IsColdShipping,
    decimal BaseFee,
    bool IsActive
);
