using Core.DTOs;
using Core.Interfaces;
using Microsoft.AspNetCore.Mvc;

namespace ExpensesTracker.Controllers.v1
{
    [ApiVersion("1.0")]
    [Route("api/v{v:apiVersion}/[controller]")]
    [ApiController]
    public class RevenueController : ControllerBase
    {
        private readonly IRevenueService _service;

        public RevenueController(IRevenueService service)
        {
            _service = service;
        }

        [HttpGet]
        public async Task<IActionResult> Get()
        {
            var revenues = await _service.GetRevenuesAsync();
            if (!revenues.Any()) return NoContent();
            return Ok(revenues);
        }

        [HttpGet("{revenueId:int}")]
        public async Task<IActionResult> Get(int revenueId)
        {
            var revenue = await _service.GetRevenueByIdAsync(revenueId);
            if (revenue == null) return NotFound($"No Revenue found with id {revenueId}");
            return Ok(revenue);
        }

        [HttpGet("user/{userId:int}")]
        public async Task<IActionResult> GetRevenuesByUserId(int userId, [FromQuery] int? year = null, [FromQuery] int? month = null)
        {
            _ = new List<RevenueDto>();
            List<RevenueDto>? userRevenues;
            if (year != null && month != null)
                userRevenues = await _service.GetUserRevenuesByParamsAsync(userId, year.Value, month.Value);
            else
                userRevenues = await _service.GetRevenuesByUserIdAsync(userId);

            if (!userRevenues.Any()) return NoContent();
            return Ok(userRevenues);
        }

        [HttpGet("{userId:int}/[action]")]
        public async Task<IActionResult> GetUserYearlyRevenues(int userId, [FromQuery] int year)
        {
            try
            {
                var userRevenues = await _service.GetUserYearlyExpensesAsync(userId, year);
                if (!userRevenues.Any()) return NoContent();
                return Ok(userRevenues);
            }
            catch (Exception e)
            {
                return BadRequest(e.Message);
            }
        }

        [HttpPost]
        public async Task<IActionResult> Post(RevenueDto revenueDto)
        {
            try
            {
                var newRevenue = await _service.InsertRevenueAsync(revenueDto);
                return Ok(newRevenue);
            }
            catch (Exception e)
            {
                return BadRequest(e.Message);
            }
        }

        [HttpPut("{revenueId:int}")]
        public async Task<IActionResult> Put(int revenueId, RevenueDto revenueDto)
        {
            try
            {
                if (revenueId != revenueDto.Id) return BadRequest("Error in Id!");
                var revenueToUpdate = await _service.UpdateRevenueAsync(revenueId, revenueDto);
                if (revenueToUpdate == null) return BadRequest("Revenue could not be updated!");
                return Ok(revenueToUpdate);
            }
            catch (Exception e)
            {
                return BadRequest(e.Message);
            }
        }

        [HttpDelete("{revenueId:int}")]
        public async Task<IActionResult> Delete(int revenueId)
        {
            try
            {
                var checkDelete = await _service.DeleteRevenueByIdAsync(revenueId);
                if (!checkDelete) return BadRequest("Revenue could not be deleted!");
                return Ok(checkDelete);
            }
            catch (Exception e)
            {
                return BadRequest(e.Message);
            }
        }
    }
}