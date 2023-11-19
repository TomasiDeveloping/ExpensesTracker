using Asp.Versioning;
using Core.DTOs;
using Core.Interfaces;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace Api.Controllers.v1;

[Authorize]
[ApiVersion("1.0")]
[Route("api/v{v:apiVersion}/[controller]")]
[ApiController]
public class CategoriesController : ControllerBase
{
    private readonly ILogger<CategoriesController> _logger;
    private readonly ICategoryService _service;

    public CategoriesController(ICategoryService service, ILogger<CategoriesController> logger)
    {
        _service = service;
        _logger = logger;
    }

    [HttpGet]
    public async Task<IActionResult> Get()
    {
        var categories = await _service.GetCategoriesAsync();
        if (!categories.Any()) return NoContent();
        return Ok(categories);
    }

    [HttpGet("{categoryId:int}")]
    public async Task<IActionResult> Get(int categoryId)
    {
        var category = await _service.GetCategoryByIdAsync(categoryId);
        if (category == null) return NotFound($"No category found with id: {categoryId}");
        return Ok(category);
    }

    [HttpGet("user/{userId:int}")]
    public async Task<IActionResult> GetUserCategories(int userId)
    {
        var userCategories = await _service.GetCategoriesByUserIdAsync(userId);
        if (!userCategories.Any()) return NoContent();
        return Ok(userCategories);
    }

    [HttpPost]
    public async Task<IActionResult> CreateCategory(CategoryDto categoryDto)
    {
        try
        {
            var newCategory = await _service.InsertCategoryAsync(categoryDto);
            return Ok(newCategory);
        }
        catch (Exception e)
        {
            _logger.LogError(e, $"Something Went Wrong in {nameof(CreateCategory)}");
            return BadRequest(e.Message);
        }
    }

    [HttpPut("{categoryId:int}")]
    public async Task<IActionResult> UpdateCategory(int categoryId, CategoryDto categoryDto)
    {
        try
        {
            if (categoryId != categoryDto.Id) return BadRequest("Error with Id!");
            var categoryToUpdate = await _service.UpdateCategoryAsync(categoryId, categoryDto);
            return Ok(categoryToUpdate);
        }
        catch (Exception e)
        {
            _logger.LogError(e, $"Something Went Wrong in {nameof(UpdateCategory)}");
            return BadRequest(e.Message);
        }
    }

    [HttpDelete("{categoryId:int}")]
    public async Task<IActionResult> DeleteCategory(int categoryId)
    {
        try
        {
            var checkDelete = await _service.DeleteCategoryById(categoryId);
            if (!checkDelete) return BadRequest($"Category with id {categoryId} could not be deleted!");
            return Ok(true);
        }
        catch (Exception e)
        {
            _logger.LogError(e, $"Something Went Wrong in {nameof(DeleteCategory)}");
            return BadRequest(e.Message);
        }
    }
}