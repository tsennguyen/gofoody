namespace GoFoody.Api.Features.Admin.Dashboard;

public sealed record RevenueDailyPointDto(
    DateTime Date, // UTC date part (CreatedAt.Date). Nếu muốn local TZ, chuyển đổi trên frontend.
    decimal Revenue,
    int OrdersCount,
    decimal AverageOrderValue
);

public sealed record RevenueMonthlyPointDto(
    int Year,
    int Month,
    decimal Revenue,
    int OrdersCount,
    decimal AverageOrderValue
);

public sealed record RevenueOverviewDto(
    decimal TotalRevenue,
    int TotalOrders,
    decimal AverageOrderValue,
    decimal TodayRevenue,
    decimal ThisMonthRevenue,
    decimal PreviousMonthRevenue
);

public sealed record RevenueDailyResponse(
    RevenueOverviewDto Overview,
    IReadOnlyList<RevenueDailyPointDto> Points
);

public sealed record RevenueMonthlyResponse(
    RevenueOverviewDto Overview,
    IReadOnlyList<RevenueMonthlyPointDto> Points
);
