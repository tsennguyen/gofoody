using GoFoody.Api.Features.Catalog.Models;
using GoFoody.Api.Features.Orders.Models;
using GoFoody.Infrastructure.Data;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace GoFoody.Api.Features.Orders;

[ApiController]
[Route("api/admin/orders")]
[Authorize(Roles = "ADMIN")]
public sealed class AdminOrdersController : ControllerBase
{
    private readonly GoFoodyDbContext _db;

    public AdminOrdersController(GoFoodyDbContext db)
    {
        _db = db;
    }

    [HttpGet]
    public async Task<ActionResult<PagedResult<OrderListItemDto>>> GetOrders(
        [FromQuery] int? userId,
        [FromQuery] OrderStatus? status,
        [FromQuery] PaymentStatus? paymentStatus,
        [FromQuery] DateTime? fromDate,
        [FromQuery] DateTime? toDate,
        [FromQuery] string? orderCode,
        [FromQuery] int page = 1,
        [FromQuery] int pageSize = 20,
        CancellationToken cancellationToken = default)
    {
        page = page < 1 ? 1 : page;
        pageSize = Math.Clamp(pageSize, 1, 100);

        var query = _db.Orders.AsNoTracking().AsQueryable();
        if (userId.HasValue) query = query.Where(o => o.UserId == userId.Value);
        if (status.HasValue) query = query.Where(o => o.Status == (byte)status.Value);
        if (paymentStatus.HasValue) query = query.Where(o => o.PaymentStatus == (byte)paymentStatus.Value);
        if (fromDate.HasValue) query = query.Where(o => o.CreatedAt >= fromDate.Value);
        if (toDate.HasValue) query = query.Where(o => o.CreatedAt <= toDate.Value);
        if (!string.IsNullOrWhiteSpace(orderCode))
        {
            var code = orderCode.Trim().ToLowerInvariant();
            query = query.Where(o => o.OrderCode.ToLower().Contains(code));
        }

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

    [HttpGet("{orderId:long}")]
    public async Task<ActionResult<OrderDetailDto>> GetOrderDetail(long orderId, CancellationToken cancellationToken = default)
    {
        var order = await _db.Orders
            .AsNoTracking()
            .Where(o => o.Id == orderId)
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

    [HttpGet("code/{orderCode}")]
    public async Task<ActionResult<OrderDetailDto>> GetOrderDetailByCode(
        string orderCode,
        CancellationToken cancellationToken = default)
    {
        var normalized = orderCode.Trim().ToLowerInvariant();
        var order = await _db.Orders
            .AsNoTracking()
            .Where(o => o.OrderCode.ToLower() == normalized)
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

    [HttpPut("{orderId:long}/status")]
    public async Task<ActionResult<OrderDetailDto>> UpdateStatus(
        long orderId,
        [FromBody] OrderStatusUpdateRequest request,
        CancellationToken cancellationToken = default)
    {
        var order = await _db.Orders.FirstOrDefaultAsync(o => o.Id == orderId, cancellationToken);
        if (order is null) return NotFound();

        if (order.Status == (byte)OrderStatus.Cancelled && request.Status != OrderStatus.Cancelled)
        {
            return BadRequest("Đơn đã hủy không thể đổi trạng thái.");
        }

        order.Status = (byte)request.Status;
        if (request.PaymentStatus.HasValue)
        {
            order.PaymentStatus = (byte)request.PaymentStatus.Value;
        }
        order.UpdatedAt = DateTime.UtcNow;

        await _db.SaveChangesAsync(cancellationToken);

        return await GetOrderDetail(orderId, cancellationToken);
    }

    [HttpPut("code/{orderCode}/status")]
    public async Task<ActionResult<OrderDetailDto>> UpdateStatusByCode(
        string orderCode,
        [FromBody] OrderStatusUpdateRequest request,
        CancellationToken cancellationToken = default)
    {
        var normalized = orderCode.Trim().ToLowerInvariant();
        var order = await _db.Orders.FirstOrDefaultAsync(o => o.OrderCode.ToLower() == normalized, cancellationToken);
        if (order is null) return NotFound();

        if (order.Status == (byte)OrderStatus.Cancelled && request.Status != OrderStatus.Cancelled)
        {
            return BadRequest("Đơn đã hủy không thể đổi trạng thái.");
        }

        order.Status = (byte)request.Status;
        if (request.PaymentStatus.HasValue)
        {
            order.PaymentStatus = (byte)request.PaymentStatus.Value;
        }
        order.UpdatedAt = DateTime.UtcNow;

        await _db.SaveChangesAsync(cancellationToken);

        return await GetOrderDetail(order.Id, cancellationToken);
    }

    [HttpGet("stats")]
    public async Task<ActionResult<OrderStatsDto>> GetStats(
        [FromQuery] DateTime? fromDate,
        [FromQuery] DateTime? toDate,
        CancellationToken cancellationToken = default)
    {
        var query = _db.Orders.AsNoTracking().AsQueryable();
        if (fromDate.HasValue) query = query.Where(o => o.CreatedAt >= fromDate.Value);
        if (toDate.HasValue) query = query.Where(o => o.CreatedAt <= toDate.Value);

        var totalOrders = await query.CountAsync(cancellationToken);
        var pending = await query.CountAsync(o => o.Status == (byte)OrderStatus.Pending, cancellationToken);
        var completed = await query.CountAsync(o => o.Status == (byte)OrderStatus.Completed, cancellationToken);
        var cancelled = await query.CountAsync(o => o.Status == (byte)OrderStatus.Cancelled, cancellationToken);
        var totalRevenue = await query.Where(o => o.Status == (byte)OrderStatus.Completed)
            .SumAsync(o => (decimal?)o.TotalAmount ?? 0, cancellationToken);

        var today = DateTime.UtcNow.Date;
        var todayRevenue = await query
            .Where(o => o.Status == (byte)OrderStatus.Completed && o.CreatedAt.Date == today)
            .SumAsync(o => (decimal?)o.TotalAmount ?? 0, cancellationToken);

        var month = new DateTime(DateTime.UtcNow.Year, DateTime.UtcNow.Month, 1);
        var nextMonth = month.AddMonths(1);
        var thisMonthRevenue = await query
            .Where(o => o.Status == (byte)OrderStatus.Completed && o.CreatedAt >= month && o.CreatedAt < nextMonth)
            .SumAsync(o => (decimal?)o.TotalAmount ?? 0, cancellationToken);

        var dto = new OrderStatsDto(
            totalOrders,
            pending,
            completed,
            cancelled,
            totalRevenue,
            todayRevenue,
            thisMonthRevenue
        );

        return Ok(dto);
    }
}
