using Asp.Versioning;
using Core.DTOs;
using Core.Interfaces;
using Microsoft.AspNetCore.Mvc;

namespace Api.Controllers.v1;

[ApiVersion("1.0")]
[Route("api/v{v:apiVersion}/[controller]")]
[ApiController]
public class RevenueCategoryController(IRevenueCategoryService service, ILogger<RevenueCategoryController> logger) : ControllerBase
{
    [HttpGet]
    public async Task<IActionResult> Get()
    {
        var revenueCategories = await service.GetRevenueCategoriesAsync();
        if (!revenueCategories.Any()) return NoContent();
        return Ok(revenueCategories);
    }

    [HttpGet("{revenueCategoryId}")]
    public async Task<IActionResult> Get(int revenueCategoryId)
    {
        var revenueCategory = await service.GetRevenueCategoryByIdAsync(revenueCategoryId);
        if (revenueCategory == null)
            return NotFound($"Could not found Revenue Category with id {revenueCategoryId}");
        return Ok(revenueCategory);
    }

    [HttpGet("user/{userId}")]
    public async Task<IActionResult> GetUserRevenueCategories(int userId)
    {
        var userRevenuesCategories = await service.GetRevenueCategoriesByUserIdAsync(userId);
        if (!userRevenuesCategories.Any()) return NoContent();
        return Ok(userRevenuesCategories);
    }

    [HttpPost]
    public async Task<IActionResult> CreateRevenueCategory(RevenueCategoryDto revenueCategoryDto)
    {
        try
        {
            var newRevenueCategory = await service.InsertRevenueCategoryAsync(revenueCategoryDto);
            return Ok(newRevenueCategory);
        }
        catch (Exception e)
        {
            logger.LogError(e, $"Something Went Wrong in {nameof(CreateRevenueCategory)}");
            return BadRequest(e.Message);
        }
    }

    [HttpPut("{revenueCategoryId}")]
    public async Task<IActionResult> UpdateRevenueCategory(int revenueCategoryId, RevenueCategoryDto revenueCategoryDto)
    {
        try
        {
            if (revenueCategoryId != revenueCategoryDto.Id) return BadRequest("Error with Id!");
            var revenueCategoryUpdate =
                await service.UpdateRevenueCategoryAsync(revenueCategoryId, revenueCategoryDto);
            if (revenueCategoryUpdate == null) return BadRequest("Revenue Category could not be updated!");
            return Ok(revenueCategoryUpdate);
        }
        catch (Exception e)
        {
            logger.LogError(e, $"Something Went Wrong in {nameof(UpdateRevenueCategory)}");
            return BadRequest(e.Message);
        }
    }

    [HttpDelete("{revenueCategoryId}")]
    public async Task<IActionResult> DeleteRevenueCategory(int revenueCategoryId)
    {
        try
        {
            var checkDelete = await service.DeleteRevenueCategoryById(revenueCategoryId);
            if (!checkDelete) return BadRequest("Revenue Category could not be deleted!");
            return Ok(true);
        }
        catch (Exception e)
        {
            logger.LogError($"Something Went Wrong in {nameof(DeleteRevenueCategory)}");
            return BadRequest(e.Message);
        }
    }
}