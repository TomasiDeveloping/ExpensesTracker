using Asp.Versioning;
using Core.DTOs;
using Core.Interfaces;
using Microsoft.AspNetCore.Mvc;

namespace Api.Controllers.v1;

[ApiVersion("1.0")]
[Route("api/v{v:apiVersion}/[controller]")]
[ApiController]
public class RecurringTaskController(IRecurringTaskService recurringTaskService, ILogger<RecurringTaskController> logger) : ControllerBase
{
    [HttpGet("{userId}")]
    public async Task<IActionResult> GetRecurringTasks(int userId)
    {
        try
        {
            var recurringTasks = await recurringTaskService.GetRecurringTasksByUserIdAsync(userId);
            if (!recurringTasks.Any()) return NoContent();
            return Ok(recurringTasks);
        }
        catch (Exception e)
        {
            logger.LogError(e, $"Something Went Wrong in {nameof(GetRecurringTasks)}");
            return BadRequest(e.Message);
        }
    }

    [HttpPost]
    public async Task<IActionResult> InsertRecurringTask(RecurringTaskDto recurringTaskDto)
    {
        try
        {
            var newRecurringTask = await recurringTaskService.InsertRecurringTaskAsync(recurringTaskDto);
            return Ok(newRecurringTask);
        }
        catch (Exception e)
        {
            logger.LogError(e, $"Something Went Wrong in {nameof(InsertRecurringTask)}");
            return BadRequest(e.Message);
        }
    }

    [HttpPut("{recurringTaskId}")]
    public async Task<IActionResult> UpdateRecurringTask(int recurringTaskId, RecurringTaskDto recurringTaskDto)
    {
        try
        {
            if (recurringTaskId != recurringTaskDto.Id) return BadRequest("Error in id's!");
            var updatedRecurringTask = await recurringTaskService.UpdateRecurringTaskAsync(recurringTaskDto);
            return Ok(updatedRecurringTask);
        }
        catch (Exception e)
        {
            logger.LogError(e, $"Something Went Wrong in {nameof(UpdateRecurringTask)}");
            return BadRequest(e.Message);
        }
    }

    [HttpDelete("{recurringTaskId}")]
    public async Task<IActionResult> DeleteRecurringTask(int recurringTaskId)
    {
        try
        {
            var checkDelete = await recurringTaskService.DeleteRecurringAsync(recurringTaskId);
            return checkDelete ? Ok(true) : BadRequest("Could not delete Recurring Task!");
        }
        catch (Exception e)
        {
            logger.LogError(e, $"Something Went Wrong in {nameof(DeleteRecurringTask)}");
            return BadRequest(e.Message);
        }
    }
}