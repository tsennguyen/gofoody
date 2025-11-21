using GoFoody.Api.Common;
using GoFoody.Api.Features.Orders.Models;
using GoFoody.Api.Features.Catalog.Models;
using GoFoody.Infrastructure.Data;
using GoFoody.Infrastructure.Entities;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace GoFoody.Api.Features.Orders;

[ApiController]
[Route("api")]
public sealed class OrdersController : ControllerBase
{
    private readonly GoFoodyDbContext _db;

    public OrdersController(GoFoodyDbContext db)
    {
        _db = db;
    }

    [HttpGet("shipping-methods")]
    public async Task<ActionResult<IEnumerable<ShippingMethodDto>>> GetShippingMethods(CancellationToken cancellationToken)
    {
        var methods = await _db.ShippingMethods
            .AsNoTracking()
            .Where(sm => sm.IsActive)
            .OrderBy(sm => sm.Id)
            .Select(sm => new ShippingMethodDto(
                sm.Id,
                sm.Code,
                sm.Name,
                sm.Description,
                sm.IsColdShipping,
                sm.BaseFee))
            .ToListAsync(cancellationToken);

        return Ok(methods);
    }

    [HttpGet("payment-methods")]
    public async Task<ActionResult<IEnumerable<PaymentMethodDto>>> GetPaymentMethods(CancellationToken cancellationToken)
    {
        var methods = await _db.PaymentMethods
            .AsNoTracking()
            .Where(pm => pm.IsActive)
            .OrderBy(pm => pm.Id)
            .Select(pm => new PaymentMethodDto(
                pm.Id,
                pm.Code,
                pm.Name,
                pm.Description))
            .ToListAsync(cancellationToken);

        return Ok(methods);
    }

    [Authorize(Roles = "CUSTOMER")]
    [HttpGet("orders/my")]
    public async Task<ActionResult<PagedResult<OrderListItemDto>>> GetMyOrders(
        [FromQuery] int page = 1,
        [FromQuery] int pageSize = 10,
        [FromQuery] OrderStatus? status = null,
        [FromQuery] DateTime? fromDate = null,
        [FromQuery] DateTime? toDate = null,
        CancellationToken cancellationToken = default)
    {
        var userId = User.GetUserId();
        if (userId is null) return Unauthorized();

        page = page < 1 ? 1 : page;
        pageSize = Math.Clamp(pageSize, 1, 50);

        var query = _db.Orders.AsNoTracking()
            .Where(o => o.UserId == userId.Value);

        if (status.HasValue) query = query.Where(o => o.Status == (byte)status.Value);
        if (fromDate.HasValue) query = query.Where(o => o.CreatedAt >= fromDate.Value);
        if (toDate.HasValue) query = query.Where(o => o.CreatedAt <= toDate.Value);

        var totalItems = await query.CountAsync(cancellationToken);
        var totalPages = (int)Math.Ceiling(totalItems / (double)pageSize);

        var items = await query
            .OrderByDescending(o => o.CreatedAt)
            .Skip((page - 1) * pageSize)
            .Take(pageSize)
            .Select(o => new OrderListItemDto(
                o.Id,
                o.OrderCode,
                o.CreatedAt,
                o.TotalAmount,
                (OrderStatus)o.Status,
                (PaymentStatus)o.PaymentStatus,
                o.ShippingMethod != null ? o.ShippingMethod.Name : null,
                o.PaymentMethod != null ? o.PaymentMethod.Name : null,
                o.OrderItems.Sum(oi => oi.Quantity),
                o.RequiresColdShipping))
            .ToListAsync(cancellationToken);

        return Ok(new PagedResult<OrderListItemDto>(items, page, pageSize, totalItems, totalPages));
    }

    [Authorize(Roles = "CUSTOMER")]
    [HttpGet("orders/my/{orderCode}")]
    public async Task<ActionResult<OrderDetailDto>> GetMyOrderDetail(
        string orderCode,
        CancellationToken cancellationToken = default)
    {
        var userId = User.GetUserId();
        if (userId is null) return Unauthorized();

        var normalized = orderCode.Trim().ToLowerInvariant();
        var order = await _db.Orders
            .AsNoTracking()
            .Where(o => o.UserId == userId.Value && o.OrderCode.ToLower() == normalized)
            .Select(o => new
            {
                o.Id,
                o.OrderCode,
                o.CreatedAt,
                o.UpdatedAt,
                o.Subtotal,
                o.ShippingFee,
                o.TotalAmount,
                o.Status,
                o.PaymentStatus,
                o.CustomerName,
                o.CustomerPhone,
                o.CustomerEmail,
                ShippingAddress = o.ShippingAddressText,
                o.Note,
                ShippingMethodName = o.ShippingMethod != null ? o.ShippingMethod.Name : null,
                PaymentMethodName = o.PaymentMethod != null ? o.PaymentMethod.Name : null,
                o.RequiresColdShipping,
                Items = o.OrderItems.Select(oi => new OrderItemDto(
                    oi.Id,
                    oi.ProductId,
                    oi.ProductVariantId,
                    oi.ProductName,
                    oi.Unit,
                    oi.Quantity,
                    oi.UnitPrice,
                    oi.LineTotal
                )).ToList()
            })
            .FirstOrDefaultAsync(cancellationToken);

        if (order is null) return NotFound();

        var dto = new OrderDetailDto(
            order.Id,
            order.OrderCode,
            order.CreatedAt,
            order.UpdatedAt,
            order.Subtotal,
            order.ShippingFee,
            order.TotalAmount,
            (OrderStatus)order.Status,
            (PaymentStatus)order.PaymentStatus,
            order.CustomerName,
            order.CustomerPhone,
            order.CustomerEmail,
            order.ShippingAddress,
            order.Note,
            order.ShippingMethodName,
            order.PaymentMethodName,
            order.RequiresColdShipping,
            order.Items
        );

        return Ok(dto);
    }

    [Authorize]
    [HttpPost("orders/checkout")]
    public async Task<ActionResult<OrderCreatedDto>> Checkout(
        [FromBody] CheckoutRequest request,
        CancellationToken cancellationToken)
    {
        var userId = User.GetUserId();
        if (userId is null) return Unauthorized();

        if (string.IsNullOrWhiteSpace(request.FullName) ||
            string.IsNullOrWhiteSpace(request.Phone) ||
            string.IsNullOrWhiteSpace(request.AddressLine))
        {
            return BadRequest("FullName, Phone, AddressLine are required.");
        }

        var cart = await _db.Carts.FirstOrDefaultAsync(c => c.UserId == userId.Value, cancellationToken);
        if (cart is null)
        {
            return BadRequest("Cart is empty.");
        }

        var cartItems = await _db.CartItems
            .Where(ci => ci.CartId == cart.Id)
            .Include(ci => ci.ProductVariant!)
                .ThenInclude(v => v.Product)
            .AsNoTracking()
            .ToListAsync(cancellationToken);

        if (cartItems.Count == 0)
        {
            return BadRequest("Cart is empty.");
        }

        var shippingMethod = await _db.ShippingMethods
            .AsNoTracking()
            .FirstOrDefaultAsync(sm => sm.Id == request.ShippingMethodId && sm.IsActive, cancellationToken);
        if (shippingMethod is null) return BadRequest("Shipping method invalid.");

        var paymentMethod = await _db.PaymentMethods
            .AsNoTracking()
            .FirstOrDefaultAsync(pm => pm.Id == request.PaymentMethodId && pm.IsActive, cancellationToken);
        if (paymentMethod is null) return BadRequest("Payment method invalid.");

        // Validate inventory
        foreach (var item in cartItems)
        {
            var variant = item.ProductVariant!;
            if (variant.Status == 0 || variant.StockQuantity < item.Quantity)
            {
                return BadRequest("Một số sản phẩm không đủ tồn kho hoặc không khả dụng.");
            }
        }

        decimal subtotal = 0;
        var requiresCold = false;
        foreach (var item in cartItems)
        {
            var variant = item.ProductVariant!;
            subtotal += variant.Price * item.Quantity;
            requiresCold = requiresCold || variant.RequireColdShipping;
        }

        var shippingFee = shippingMethod.BaseFee;
        decimal discount = 0;
        var total = subtotal + shippingFee - discount;

        var user = await _db.Users.AsNoTracking().FirstOrDefaultAsync(u => u.Id == userId.Value, cancellationToken);

        await using var tx = await _db.Database.BeginTransactionAsync(cancellationToken);
        try
        {
            var order = new Order
            {
                OrderCode = GenerateOrderCode(),
                UserId = userId.Value,
                CustomerName = request.FullName,
                CustomerPhone = request.Phone,
                CustomerEmail = user?.Email,
                ShippingAddressText = BuildAddress(request),
                ShippingMethodId = shippingMethod.Id,
                PaymentMethodId = paymentMethod.Id,
                Subtotal = subtotal,
                ShippingFee = shippingFee,
                DiscountAmount = discount,
                TotalAmount = total,
                RequiresColdShipping = requiresCold,
                Status = 0,
                PaymentStatus = 0,
                CreatedAt = DateTime.UtcNow,
                Note = request.Note,
            };

            _db.Orders.Add(order);
            await _db.SaveChangesAsync(cancellationToken);

            var orderItems = cartItems.Select(ci =>
            {
                var variant = ci.ProductVariant!;
                var product = variant.Product!;
                return new OrderItem
                {
                    OrderId = order.Id,
                    ProductId = product.Id,
                    ProductVariantId = variant.Id,
                    ProductName = product.Name,
                    Unit = variant.Unit,
                    Quantity = ci.Quantity,
                    UnitPrice = variant.Price,
                    LineTotal = variant.Price * ci.Quantity
                };
            }).ToList();

            _db.OrderItems.AddRange(orderItems);

            // Optional: reduce stock
            foreach (var ci in cartItems)
            {
                var variant = await _db.ProductVariants.FirstAsync(v => v.Id == ci.ProductVariantId, cancellationToken);
                variant.StockQuantity = Math.Max(0, variant.StockQuantity - ci.Quantity);
            }

            // Clear cart
            var toRemove = _db.CartItems.Where(ci => ci.CartId == cart.Id);
            _db.CartItems.RemoveRange(toRemove);

            await _db.SaveChangesAsync(cancellationToken);
            await tx.CommitAsync(cancellationToken);

            var dto = new OrderCreatedDto(
                order.Id,
                order.OrderCode,
                order.Subtotal,
                order.ShippingFee,
                order.TotalAmount,
                order.RequiresColdShipping,
                order.CreatedAt);

            return Ok(dto);
        }
        catch
        {
            await tx.RollbackAsync(cancellationToken);
            throw;
        }
    }

    private static string BuildAddress(CheckoutRequest req)
    {
        var parts = new List<string> { req.AddressLine };
        if (!string.IsNullOrWhiteSpace(req.Ward)) parts.Add(req.Ward);
        if (!string.IsNullOrWhiteSpace(req.District)) parts.Add(req.District);
        if (!string.IsNullOrWhiteSpace(req.City)) parts.Add(req.City);
        return string.Join(", ", parts);
    }

    private static string GenerateOrderCode()
    {
        var now = DateTime.UtcNow;
        var rand = Random.Shared.Next(100, 999);
        return $"GOF{now:yyyyMMddHHmmss}-{rand}";
    }
}
