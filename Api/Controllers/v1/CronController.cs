using Asp.Versioning;
using Core.Interfaces;
using Microsoft.AspNetCore.Mvc;

namespace Api.Controllers.v1;

[ApiVersion("1.0")]
[Route("api/v{v:apiVersion}/[controller]")]
[ApiController]
public class CronController(ICronService cronService, ILogger<CronController> logger) : ControllerBase
{
    [HttpGet("[action]")]
    public async Task<IActionResult> RunRecurringTasks()
    {
        try
        {
            var checkRun = await cronService.CreateRecurringTasks();
            return checkRun ? Ok(true) : BadRequest("Error in CreateRecurringTasks");
        }
        catch (Exception e)
        {
            logger.LogError(e, $"Something Went Wrong in {nameof(RunRecurringTasks)}");
            return BadRequest(e.Message);
        }
    }
}