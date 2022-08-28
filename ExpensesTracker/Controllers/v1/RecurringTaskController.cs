using Core.DTOs;
using Core.Interfaces;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;

namespace ExpensesTracker.Controllers.v1
{
    [ApiVersion("1.0")]
    [Route("api/v{v:apiVersion}/[controller]")]
    [ApiController]
    public class RecurringTaskController : ControllerBase
    {
        private readonly IRecurringTaskService _recurringTaskService;

        public RecurringTaskController(IRecurringTaskService recurringTaskService)
        {
            _recurringTaskService = recurringTaskService;
        }

        [HttpGet("{userId:int}")]
        public async Task<IActionResult> GetRecurringTasks(int userId)
        {
            try
            {
                var recurringTasks = await _recurringTaskService.GetRecurringTasksByUserIdAsync(userId);
                if (!recurringTasks.Any()) return NoContent();
                return Ok(recurringTasks);
            }
            catch (Exception e)
            {
                return BadRequest(e.Message);
            }
        }

        [HttpPost]
        public async Task<IActionResult> InsertRecurringTask(RecurringTaskDto recurringTaskDto)
        {
            try
            {
                var newRecurringTask = await _recurringTaskService.InsertRecurringTaskAsync(recurringTaskDto);
                return Ok(newRecurringTask);
            }
            catch (Exception e)
            {
                return BadRequest(e.Message);
            }
        }

        [HttpPut("{recurringTaskId:int}")]
        public async Task<IActionResult> UpdateRecurringTask(int recurringTaskId, RecurringTaskDto recurringTaskDto)
        {
            try
            {
                if (recurringTaskId != recurringTaskDto.Id) return BadRequest("Error in id's!");
                var updatedRecurringTask = await _recurringTaskService.UpdateRecurringTaskAsync(recurringTaskDto);
                return Ok(updatedRecurringTask);
            }
            catch (Exception e)
            {
                return BadRequest(e.Message);
            }
        }

        [HttpDelete("{recurringTaskId:int}")]
        public async Task<IActionResult> DeleteRecurringTask(int recurringTaskId)
        {
            try
            {
                var checkDelete = await _recurringTaskService.DeleteRecurringAsync(recurringTaskId);
                return checkDelete ? Ok() : BadRequest("Could not delete Recurring Task!");
            }
            catch (Exception e)
            {
                return BadRequest(e.Message);
            }
        }
    }
}
