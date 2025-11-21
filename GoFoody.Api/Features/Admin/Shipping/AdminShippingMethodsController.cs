using GoFoody.Api.Features.Admin.Shipping;
using GoFoody.Infrastructure.Data;
using GoFoody.Infrastructure.Entities;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace GoFoody.Api.Features.Admin.Shipping;

[ApiController]
[Route("api/admin/shipping-methods")]
[Authorize(Roles = "ADMIN")]
public sealed class AdminShippingMethodsController : ControllerBase
{
    private readonly GoFoodyDbContext _db;

    public AdminShippingMethodsController(GoFoodyDbContext db)
    {
        _db = db;
    }

    [HttpGet]
    public async Task<ActionResult<IEnumerable<ShippingMethodAdminDto>>> GetAll([FromQuery] bool? isActive, CancellationToken cancellationToken)
    {
        var query = _db.ShippingMethods.AsNoTracking().AsQueryable();
        if (isActive.HasValue)
        {
            query = query.Where(sm => sm.IsActive == isActive.Value);
        }

        var list = await query
            .OrderBy(sm => sm.Id)
            .Select(sm => new ShippingMethodAdminDto(
                sm.Id,
                sm.Code,
                sm.Name,
                sm.Description,
                sm.IsColdShipping,
                sm.BaseFee,
                sm.IsActive))
            .ToListAsync(cancellationToken);

        return Ok(list);
    }

    [HttpGet("{id:int}")]
    public async Task<ActionResult<ShippingMethodAdminDto>> Get(int id, CancellationToken cancellationToken)
    {
        var sm = await _db.ShippingMethods
            .AsNoTracking()
            .Where(s => s.Id == id)
            .Select(sm => new ShippingMethodAdminDto(
                sm.Id,
                sm.Code,
                sm.Name,
                sm.Description,
                sm.IsColdShipping,
                sm.BaseFee,
                sm.IsActive))
            .FirstOrDefaultAsync(cancellationToken);

        return sm is null ? NotFound() : Ok(sm);
    }

    [HttpPost]
    public async Task<ActionResult<ShippingMethodAdminDto>> Create(
        [FromBody] ShippingMethodAdminUpsertRequest request,
        CancellationToken cancellationToken)
    {
        var code = request.Code.Trim().ToUpperInvariant();
        var exists = await _db.ShippingMethods.AnyAsync(sm => sm.Code == code, cancellationToken);
        if (exists) return BadRequest("Code already exists.");

        var sm = new ShippingMethod
        {
            Code = code,
            Name = request.Name,
            Description = request.Description,
            IsColdShipping = request.IsColdShipping,
            BaseFee = request.BaseFee,
            IsActive = request.IsActive
        };

        _db.ShippingMethods.Add(sm);
        await _db.SaveChangesAsync(cancellationToken);

        return CreatedAtAction(nameof(Get), new { id = sm.Id }, new ShippingMethodAdminDto(
            sm.Id,
            sm.Code,
            sm.Name,
            sm.Description,
            sm.IsColdShipping,
            sm.BaseFee,
            sm.IsActive));
    }

    [HttpPut("{id:int}")]
    public async Task<ActionResult<ShippingMethodAdminDto>> Update(
        int id,
        [FromBody] ShippingMethodAdminUpsertRequest request,
        CancellationToken cancellationToken)
    {
        var sm = await _db.ShippingMethods.FirstOrDefaultAsync(s => s.Id == id, cancellationToken);
        if (sm is null) return NotFound();

        var code = request.Code.Trim().ToUpperInvariant();
        var exists = await _db.ShippingMethods.AnyAsync(s => s.Code == code && s.Id != id, cancellationToken);
        if (exists) return BadRequest("Code already exists.");

        sm.Code = code;
        sm.Name = request.Name;
        sm.Description = request.Description;
        sm.IsColdShipping = request.IsColdShipping;
        sm.BaseFee = request.BaseFee;
        sm.IsActive = request.IsActive;

        await _db.SaveChangesAsync(cancellationToken);

        return Ok(new ShippingMethodAdminDto(
            sm.Id,
            sm.Code,
            sm.Name,
            sm.Description,
            sm.IsColdShipping,
            sm.BaseFee,
            sm.IsActive));
    }

    [HttpDelete("{id:int}")]
    public async Task<IActionResult> Delete(int id, CancellationToken cancellationToken)
    {
        var sm = await _db.ShippingMethods.FirstOrDefaultAsync(s => s.Id == id, cancellationToken);
        if (sm is null) return NotFound();
        sm.IsActive = false;
        await _db.SaveChangesAsync(cancellationToken);
        return NoContent();
    }
}
