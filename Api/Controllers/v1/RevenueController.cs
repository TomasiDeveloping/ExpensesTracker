using Asp.Versioning;
using Core.DTOs;
using Core.Interfaces;
using Microsoft.AspNetCore.Mvc;

namespace Api.Controllers.v1;

[ApiVersion("1.0")]
[Route("api/v{v:apiVersion}/[controller]")]
[ApiController]
public class RevenueController(IRevenueService service, ILogger<RevenueController> logger) : ControllerBase
{
    [HttpGet]
    public async Task<IActionResult> Get()
    {
        var revenues = await service.GetRevenuesAsync();
        if (!revenues.Any()) return NoContent();
        return Ok(revenues);
    }

    [HttpGet("{revenueId}")]
    public async Task<IActionResult> Get(int revenueId)
    {
        var revenue = await service.GetRevenueByIdAsync(revenueId);
        if (revenue == null) return NotFound($"No Revenue found with id {revenueId}");
        return Ok(revenue);
    }

    [HttpGet("user/{userId}")]
    public async Task<IActionResult> GetRevenuesByUserId(int userId, [FromQuery] int? year = null,
        [FromQuery] int? month = null)
    {
        _ = new List<RevenueDto>();
        List<RevenueDto> userRevenues;
        if (year != null && month != null)
            userRevenues = await service.GetUserRevenuesByParamsAsync(userId, year.Value, month.Value);
        else
            userRevenues = await service.GetRevenuesByUserIdAsync(userId);

        if (!userRevenues.Any()) return NoContent();
        return Ok(userRevenues);
    }

    [HttpGet("{userId}/[action]")]
    public async Task<IActionResult> GetUserYearlyRevenues(int userId, [FromQuery] int year)
    {
        try
        {
            var userRevenues = await service.GetUserYearlyExpensesAsync(userId, year);
            if (!userRevenues.Any()) return NoContent();
            return Ok(userRevenues);
        }
        catch (Exception e)
        {
            logger.LogError(e, $"Something Went Wrong in {nameof(GetUserYearlyRevenues)}");
            return BadRequest(e.Message);
        }
    }

    [HttpPost]
    public async Task<IActionResult> CreateRevenue(RevenueDto revenueDto)
    {
        try
        {
            var newRevenue = await service.InsertRevenueAsync(revenueDto);
            return Ok(newRevenue);
        }
        catch (Exception e)
        {
            logger.LogError(e, $"Something Went Wrong in {nameof(CreateRevenue)}");
            return BadRequest(e.Message);
        }
    }

    [HttpPut("{revenueId}")]
    public async Task<IActionResult> UpdateRevenue(int revenueId, RevenueDto revenueDto)
    {
        try
        {
            if (revenueId != revenueDto.Id) return BadRequest("Error in Id!");
            var revenueToUpdate = await service.UpdateRevenueAsync(revenueId, revenueDto);
            if (revenueToUpdate == null) return BadRequest("Revenue could not be updated!");
            return Ok(revenueToUpdate);
        }
        catch (Exception e)
        {
            logger.LogError(e, $"Something Went Wrong in {nameof(UpdateRevenue)}");
            return BadRequest(e.Message);
        }
    }

    [HttpDelete("{revenueId}")]
    public async Task<IActionResult> DeleteRevenue(int revenueId)
    {
        try
        {
            var checkDelete = await service.DeleteRevenueByIdAsync(revenueId);
            if (!checkDelete) return BadRequest("Revenue could not be deleted!");
            return Ok(true);
        }
        catch (Exception e)
        {
            logger.LogError(e, $"Something Went Wrong in {nameof(DeleteRevenue)}");
            return BadRequest(e.Message);
        }
    }
}