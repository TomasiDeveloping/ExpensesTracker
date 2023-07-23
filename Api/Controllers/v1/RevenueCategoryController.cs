using Core.DTOs;
using Core.Interfaces;
using Microsoft.AspNetCore.Mvc;

namespace Api.Controllers.v1;

[ApiVersion("1.0")]
[Route("api/v{v:apiVersion}/[controller]")]
[ApiController]
public class RevenueCategoryController : ControllerBase
{
    private readonly ILogger<RevenueCategoryController> _logger;
    private readonly IRevenueCategoryService _service;

    public RevenueCategoryController(IRevenueCategoryService service, ILogger<RevenueCategoryController> logger)
    {
        _service = service;
        _logger = logger;
    }

    [HttpGet]
    public async Task<IActionResult> Get()
    {
        var revenueCategories = await _service.GetRevenueCategoriesAsync();
        if (!revenueCategories.Any()) return NoContent();
        return Ok(revenueCategories);
    }

    [HttpGet("{revenueCategoryId:int}")]
    public async Task<IActionResult> Get(int revenueCategoryId)
    {
        var revenueCategory = await _service.GetRevenueCategoryByIdAsync(revenueCategoryId);
        if (revenueCategory == null)
            return NotFound($"Could not found Revenue Category with id {revenueCategoryId}");
        return Ok(revenueCategory);
    }

    [HttpGet("user/{userId:int}")]
    public async Task<IActionResult> GetUserRevenueCategories(int userId)
    {
        var userRevenuesCategories = await _service.GetRevenueCategoriesByUserIdAsync(userId);
        if (!userRevenuesCategories.Any()) return NoContent();
        return Ok(userRevenuesCategories);
    }

    [HttpPost]
    public async Task<IActionResult> CreateRevenueCategory(RevenueCategoryDto revenueCategoryDto)
    {
        try
        {
            var newRevenueCategory = await _service.InsertRevenueCategoryAsync(revenueCategoryDto);
            return Ok(newRevenueCategory);
        }
        catch (Exception e)
        {
            _logger.LogError(e, $"Something Went Wrong in {nameof(CreateRevenueCategory)}");
            return BadRequest(e.Message);
        }
    }

    [HttpPut("{revenueCategoryId:int}")]
    public async Task<IActionResult> UpdateRevenueCategory(int revenueCategoryId, RevenueCategoryDto revenueCategoryDto)
    {
        try
        {
            if (revenueCategoryId != revenueCategoryDto.Id) return BadRequest("Error with Id!");
            var revenueCategoryUpdate =
                await _service.UpdateRevenueCategoryAsync(revenueCategoryId, revenueCategoryDto);
            if (revenueCategoryUpdate == null) return BadRequest("Revenue Category could not be updated!");
            return Ok(revenueCategoryUpdate);
        }
        catch (Exception e)
        {
            _logger.LogError(e, $"Something Went Wrong in {nameof(UpdateRevenueCategory)}");
            return BadRequest(e.Message);
        }
    }

    [HttpDelete("{revenueCategoryId:int}")]
    public async Task<IActionResult> DeleteRevenueCategory(int revenueCategoryId)
    {
        try
        {
            var checkDelete = await _service.DeleteRevenueCategoryById(revenueCategoryId);
            if (!checkDelete) return BadRequest("Revenue Category could not be deleted!");
            return Ok(true);
        }
        catch (Exception e)
        {
            _logger.LogError($"Something Went Wrong in {nameof(DeleteRevenueCategory)}");
            return BadRequest(e.Message);
        }
    }
}