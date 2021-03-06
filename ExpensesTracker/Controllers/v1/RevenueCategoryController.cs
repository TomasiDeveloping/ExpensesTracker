using Core.DTOs;
using Core.Interfaces;
using Microsoft.AspNetCore.Mvc;

namespace ExpensesTracker.Controllers.v1
{
    [ApiVersion("1.0")]
    [Route("api/v{v:apiVersion}/[controller]")]
    [ApiController]
    public class RevenueCategoryController : ControllerBase
    {
        private readonly IRevenueCategoryService _service;

        public RevenueCategoryController(IRevenueCategoryService service)
        {
            _service = service;
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
                return BadRequest($"Could not found Revenue Category with id {revenueCategoryId}");
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
        public async Task<IActionResult> Post(RevenueCategoryDto revenueCategoryDto)
        {
            try
            {
                var newRevenueCategory = await _service.InsertRevenueCategoryAsync(revenueCategoryDto);
                return Ok(newRevenueCategory);
            }
            catch (Exception e)
            {
                return BadRequest(e.Message);
            }
        }

        [HttpPut("{revenueCategoryId:int}")]
        public async Task<IActionResult> Put(int revenueCategoryId, RevenueCategoryDto revenueCategoryDto)
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
                return BadRequest(e.Message);
            }
        }

        [HttpDelete("{revenueCategoryId:int}")]
        public async Task<IActionResult> Delete(int revenueCategoryId)
        {
            try
            {
                var checkDelete = await _service.DeleteRevenueCategoryById(revenueCategoryId);
                if (!checkDelete) return BadRequest("Revenue Category could not be deleted!");
                return Ok(checkDelete);
            }
            catch (Exception e)
            {
                return BadRequest(e.Message);
            }
        }
    }
}