using Core.Interfaces;
using Microsoft.AspNetCore.Mvc;

namespace ExpensesTracker.Controllers.v1;

[ApiVersion("1.0")]
[Route("api/v{v:apiVersion}/[controller]")]
[ApiController]
public class CronController : ControllerBase
{
    private readonly ICronService _cronService;

    public CronController(ICronService cronService)
    {
        _cronService = cronService;
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
            return BadRequest(e.Message);
        }
    }
}