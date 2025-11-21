using GoFoody.Api.Common;
using GoFoody.Api.Features.Cart.Models;
using GoFoody.Infrastructure.Data;
using GoFoody.Infrastructure.Entities;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using CartEntity = GoFoody.Infrastructure.Entities.Cart;

namespace GoFoody.Api.Features.Cart;

[ApiController]
[Route("api/[controller]")]
[Authorize]
public sealed class CartController : ControllerBase
{
    private readonly GoFoodyDbContext _db;

    public CartController(GoFoodyDbContext db)
    {
        _db = db;
    }

    [HttpGet]
    public async Task<ActionResult<CartSummaryDto>> GetCart(CancellationToken cancellationToken)
    {
        var userId = User.GetUserId();
        if (userId is null) return Unauthorized();

        var cart = await GetOrCreateCartAsync(userId.Value, cancellationToken);
        var summary = await BuildCartSummaryAsync(cart.Id, cancellationToken);
        return Ok(summary);
    }

    [HttpPost("items")]
    public async Task<ActionResult<CartSummaryDto>> AddItem(
        [FromBody] CartItemAddRequest request,
        CancellationToken cancellationToken)
    {
        var userId = User.GetUserId();
        if (userId is null) return Unauthorized();

        if (request.Quantity <= 0) return BadRequest("Quantity must be greater than 0.");

        var cart = await GetOrCreateCartAsync(userId.Value, cancellationToken);

        var variant = await _db.ProductVariants
            .Include(v => v.Product)
            .AsNoTracking()
            .FirstOrDefaultAsync(v => v.Id == request.ProductVariantId, cancellationToken);

        if (variant is null || variant.Status == 0)
        {
            return BadRequest("Product variant is not available.");
        }

        var targetQuantity = request.Quantity;
        var minOrder = variant.MinOrderQuantity;
        var maxOrder = variant.MaxOrderQuantity ?? int.MaxValue;
        targetQuantity = Math.Clamp(targetQuantity, minOrder, maxOrder);
        if (variant.StockQuantity < targetQuantity)
        {
            return BadRequest("Not enough stock.");
        }

        var existing = await _db.CartItems
            .FirstOrDefaultAsync(ci => ci.CartId == cart.Id && ci.ProductVariantId == variant.Id, cancellationToken);

        if (existing is null)
        {
            var newItem = new CartItem
            {
                CartId = cart.Id,
                ProductVariantId = variant.Id,
                Quantity = targetQuantity,
                CreatedAt = DateTime.UtcNow
            };
            _db.CartItems.Add(newItem);
        }
        else
        {
            var newQty = existing.Quantity + targetQuantity;
            newQty = Math.Clamp(newQty, minOrder, maxOrder);
            if (variant.StockQuantity < newQty)
            {
                return BadRequest("Not enough stock.");
            }
            existing.Quantity = newQty;
        }

        await _db.SaveChangesAsync(cancellationToken);

        var summary = await BuildCartSummaryAsync(cart.Id, cancellationToken);
        return Ok(summary);
    }

    [HttpPut("items/{itemId:long}")]
    public async Task<ActionResult<CartSummaryDto>> UpdateItem(
        long itemId,
        [FromBody] CartItemUpdateRequest request,
        CancellationToken cancellationToken)
    {
        var userId = User.GetUserId();
        if (userId is null) return Unauthorized();

        var cart = await GetOrCreateCartAsync(userId.Value, cancellationToken);

        var item = await _db.CartItems
            .Include(ci => ci.ProductVariant)
            .FirstOrDefaultAsync(ci => ci.Id == itemId && ci.CartId == cart.Id, cancellationToken);

        if (item is null) return NotFound();

        if (request.Quantity <= 0)
        {
            _db.CartItems.Remove(item);
        }
        else
        {
            var variant = item.ProductVariant!;
            var minOrder = variant.MinOrderQuantity;
            var maxOrder = variant.MaxOrderQuantity ?? int.MaxValue;
            var newQty = Math.Clamp(request.Quantity, minOrder, maxOrder);
            if (variant.StockQuantity < newQty)
            {
                return BadRequest("Not enough stock.");
            }
            item.Quantity = newQty;
        }

        await _db.SaveChangesAsync(cancellationToken);
        var summary = await BuildCartSummaryAsync(cart.Id, cancellationToken);
        return Ok(summary);
    }

    [HttpDelete("items/{itemId:long}")]
    public async Task<ActionResult<CartSummaryDto>> DeleteItem(
        long itemId,
        CancellationToken cancellationToken)
    {
        var userId = User.GetUserId();
        if (userId is null) return Unauthorized();

        var cart = await GetOrCreateCartAsync(userId.Value, cancellationToken);

        var item = await _db.CartItems
            .FirstOrDefaultAsync(ci => ci.Id == itemId && ci.CartId == cart.Id, cancellationToken);

        if (item != null)
        {
            _db.CartItems.Remove(item);
            await _db.SaveChangesAsync(cancellationToken);
        }

        var summary = await BuildCartSummaryAsync(cart.Id, cancellationToken);
        return Ok(summary);
    }

    [HttpDelete]
    public async Task<ActionResult<CartSummaryDto>> ClearCart(CancellationToken cancellationToken)
    {
        var userId = User.GetUserId();
        if (userId is null) return Unauthorized();

        var cart = await GetOrCreateCartAsync(userId.Value, cancellationToken);

        var items = _db.CartItems.Where(ci => ci.CartId == cart.Id);
        _db.CartItems.RemoveRange(items);
        await _db.SaveChangesAsync(cancellationToken);

        var summary = await BuildCartSummaryAsync(cart.Id, cancellationToken);
        return Ok(summary);
    }

    private async Task<CartEntity> GetOrCreateCartAsync(int userId, CancellationToken cancellationToken)
    {
        var cart = await _db.Carts.FirstOrDefaultAsync(c => c.UserId == userId, cancellationToken);
        if (cart is not null) return cart;

        cart = new CartEntity
        {
            Id = Guid.NewGuid(),
            UserId = userId,
            CreatedAt = DateTime.UtcNow
        };

        _db.Carts.Add(cart);
        await _db.SaveChangesAsync(cancellationToken);
        return cart;
    }

    private async Task<CartSummaryDto> BuildCartSummaryAsync(Guid cartId, CancellationToken cancellationToken)
    {
        var items = await _db.CartItems
            .AsNoTracking()
            .Where(ci => ci.CartId == cartId)
            .Select(ci => new
            {
                ci.Id,
                ci.ProductVariantId,
                ci.Quantity,
                Variant = ci.ProductVariant!,
                Product = ci.ProductVariant!.Product!,
                Images = ci.ProductVariant!.Product!.ProductImages
            })
            .ToListAsync(cancellationToken);

        var itemDtos = new List<CartItemDto>();
        decimal subtotal = 0;
        var requiresCold = false;
        var totalQty = 0;

        foreach (var i in items)
        {
            var variant = i.Variant;
            var product = i.Product;
            var unitPrice = variant.Price;
            var lineTotal = unitPrice * i.Quantity;
            subtotal += lineTotal;
            totalQty += i.Quantity;
            requiresCold = requiresCold || variant.RequireColdShipping;

            var thumb = i.Images
                .OrderByDescending(img => img.IsDefault)
                .ThenBy(img => img.SortOrder)
                .Select(img => img.ImageUrl)
                .FirstOrDefault();

            itemDtos.Add(new CartItemDto(
                i.Id,
                product.Id,
                variant.Id,
                product.Name,
                variant.Name,
                variant.Unit,
                unitPrice,
                i.Quantity,
                lineTotal,
                variant.RequireColdShipping,
                variant.StockQuantity,
                variant.MinOrderQuantity,
                variant.MaxOrderQuantity,
                thumb));
        }

        return new CartSummaryDto(cartId, itemDtos, subtotal, requiresCold, totalQty);
    }
}
