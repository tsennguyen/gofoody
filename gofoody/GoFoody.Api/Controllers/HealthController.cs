using GoFoody.Infrastructure.Data;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace GoFoody.Api.Controllers;

[ApiController]
[Route("api/[controller]")]
public class HealthController : ControllerBase
{
    private readonly GoFoodyDbContext _dbContext;
    private readonly ILogger<HealthController> _logger;

    public HealthController(GoFoodyDbContext dbContext, ILogger<HealthController> logger)
    {
        _dbContext = dbContext;
        _logger = logger;
    }

    [HttpGet]
    public async Task<IActionResult> Get(CancellationToken cancellationToken)
    {
        var dbStatus = "OK";
        try
        {
            var canConnect = await _dbContext.Database.CanConnectAsync(cancellationToken);
            if (!canConnect)
            {
                dbStatus = "FAIL";
            }
        }
        catch (Exception ex)
        {
            dbStatus = "FAIL";
            _logger.LogError(ex, "Database connectivity check failed.");
        }

        var response = new
        {
            status = "OK",
            time = DateTimeOffset.UtcNow,
            db = dbStatus
        };

        return Ok(response);
    }
}
