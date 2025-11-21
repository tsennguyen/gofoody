using GoFoody.Api.Features.Admin.Dashboard;
using GoFoody.Api.Features.Orders.Models;
using GoFoody.Infrastructure.Data;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace GoFoody.Api.Features.Admin.Dashboard;

[ApiController]
[Route("api/admin/dashboard")]
[Authorize(Roles = "ADMIN")]
public sealed class AdminDashboardController : ControllerBase
{
    private readonly GoFoodyDbContext _db;

    public AdminDashboardController(GoFoodyDbContext db)
    {
        _db = db;
    }

    [HttpGet("revenue-by-day")]
    public async Task<ActionResult<RevenueDailyResponse>> GetRevenueByDay(
        [FromQuery] DateTime? fromDate,
        [FromQuery] DateTime? toDate,
        CancellationToken cancellationToken = default)
    {
        // Dùng CreatedAt (UTC) và lấy phần Date. Nếu DB lưu local, frontend có thể offset lại khi hiển thị.
        var today = DateTime.UtcNow.Date;
        var start = (fromDate ?? today.AddDays(-29)).Date;
        var end = (toDate ?? today).Date;
        if (end < start) return BadRequest("toDate must be >= fromDate");

        var completedPaid = _db.Orders
            .AsNoTracking()
            .Where(o => o.Status == (byte)OrderStatus.Completed && o.PaymentStatus == (byte)PaymentStatus.Paid);

        var rangeQuery = completedPaid.Where(o => o.CreatedAt.Date >= start && o.CreatedAt.Date <= end);

        var grouped = await rangeQuery
            .GroupBy(o => o.CreatedAt.Date)
            .Select(g => new
            {
                Date = g.Key,
                Revenue = g.Sum(x => x.TotalAmount),
                OrdersCount = g.Count()
            })
            .ToListAsync(cancellationToken);

        var map = grouped.ToDictionary(x => x.Date, x => x);
        var points = new List<RevenueDailyPointDto>();
        for (var d = start; d <= end; d = d.AddDays(1))
        {
            var item = map.TryGetValue(d, out var val) ? val : null;
            var revenue = item?.Revenue ?? 0;
            var ordersCount = item?.OrdersCount ?? 0;
            var aov = ordersCount > 0 ? revenue / ordersCount : 0;
            points.Add(new RevenueDailyPointDto(d, revenue, ordersCount, aov));
        }

        var overview = await BuildOverviewAsync(completedPaid, start, end, cancellationToken);
        return Ok(new RevenueDailyResponse(overview, points));
    }

    [HttpGet("revenue-by-month")]
    public async Task<ActionResult<RevenueMonthlyResponse>> GetRevenueByMonth(
        [FromQuery] int? year,
        CancellationToken cancellationToken = default)
    {
        var today = DateTime.UtcNow;
        var targetYear = year ?? today.Year;

        var completedPaid = _db.Orders
            .AsNoTracking()
            .Where(o => o.Status == (byte)OrderStatus.Completed && o.PaymentStatus == (byte)PaymentStatus.Paid);

        var yearQuery = completedPaid.Where(o => o.CreatedAt.Year == targetYear);

        var grouped = await yearQuery
            .GroupBy(o => o.CreatedAt.Month)
            .Select(g => new
            {
                Month = g.Key,
                Revenue = g.Sum(x => x.TotalAmount),
                OrdersCount = g.Count()
            })
            .ToListAsync(cancellationToken);

        var map = grouped.ToDictionary(x => x.Month, x => x);
        var points = new List<RevenueMonthlyPointDto>();
        for (int m = 1; m <= 12; m++)
        {
            var item = map.TryGetValue(m, out var val) ? val : null;
            var revenue = item?.Revenue ?? 0;
            var ordersCount = item?.OrdersCount ?? 0;
            var aov = ordersCount > 0 ? revenue / ordersCount : 0;
            points.Add(new RevenueMonthlyPointDto(targetYear, m, revenue, ordersCount, aov));
        }

        // Overview tính theo both range (target year) và thêm Today/ThisMonth/PreviousMonth theo UTC.
        var start = new DateTime(targetYear, 1, 1);
        var end = new DateTime(targetYear, 12, 31);
        var overview = await BuildOverviewAsync(completedPaid, start, end, cancellationToken);

        return Ok(new RevenueMonthlyResponse(overview, points));
    }

    private async Task<RevenueOverviewDto> BuildOverviewAsync(
        IQueryable<Infrastructure.Entities.Order> baseQuery,
        DateTime fromDate,
        DateTime toDate,
        CancellationToken cancellationToken)
    {
        // Tổng doanh thu trong khoảng
        var rangeData = await baseQuery
            .Where(o => o.CreatedAt.Date >= fromDate.Date && o.CreatedAt.Date <= toDate.Date)
            .GroupBy(o => 1)
            .Select(g => new
            {
                Revenue = g.Sum(x => x.TotalAmount),
                OrdersCount = g.Count()
            })
            .FirstOrDefaultAsync(cancellationToken);

        var totalRevenue = rangeData?.Revenue ?? 0;
        var totalOrders = rangeData?.OrdersCount ?? 0;
        var avgOrderValue = totalOrders > 0 ? totalRevenue / totalOrders : 0;

        var today = DateTime.UtcNow.Date;
        var thisMonthStart = new DateTime(today.Year, today.Month, 1);
        var nextMonthStart = thisMonthStart.AddMonths(1);
        var prevMonthStart = thisMonthStart.AddMonths(-1);
        var prevMonthEnd = thisMonthStart.AddDays(-1);

        var todayRevenue = await baseQuery.Where(o => o.CreatedAt.Date == today)
            .SumAsync(o => (decimal?)o.TotalAmount ?? 0, cancellationToken);

        var thisMonthRevenue = await baseQuery
            .Where(o => o.CreatedAt >= thisMonthStart && o.CreatedAt < nextMonthStart)
            .SumAsync(o => (decimal?)o.TotalAmount ?? 0, cancellationToken);

        var previousMonthRevenue = await baseQuery
            .Where(o => o.CreatedAt >= prevMonthStart && o.CreatedAt <= prevMonthEnd)
            .SumAsync(o => (decimal?)o.TotalAmount ?? 0, cancellationToken);

        return new RevenueOverviewDto(
            totalRevenue,
            totalOrders,
            avgOrderValue,
            todayRevenue,
            thisMonthRevenue,
            previousMonthRevenue);
    }
}
