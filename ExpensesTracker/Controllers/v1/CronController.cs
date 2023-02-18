using Core.Interfaces;
using Microsoft.AspNetCore.Mvc;

namespace ExpensesTracker.Controllers.v1;

[ApiVersion("1.0")]
[Route("api/v{v:apiVersion}/[controller]")]
[ApiController]
public class CronController : ControllerBase
{
    private readonly ICronService _cronService;
    private readonly ILogger<CronController> _logger;

    public CronController(ICronService cronService, ILogger<CronController> logger)
    {
        _cronService = cronService;
        _logger = logger;
    }

    [HttpGet("[action]")]
    public async Task<IActionResult> RunRecurringTasks()
    {
        try
        {
            var checkRun = await _cronService.CreateRecurringTasks();
            return checkRun ? Ok(checkRun) : BadRequest("Error in CreateRecurringTasks");
        }
        catch (Exception e)
        {
            _logger.LogError(e, $"Something Went Wrong in {nameof(RunRecurringTasks)}");
            return BadRequest(e.Message);
        }
    }
}