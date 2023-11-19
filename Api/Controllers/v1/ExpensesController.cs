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
public class ExpensesController(IExpenseService service, ILogger<ExpensesController> logger) : ControllerBase
{
    [HttpGet]
    public async Task<IActionResult> Get()
    {
        var expenses = await service.GetExpensesAsync();
        if (!expenses.Any()) return NoContent();
        return Ok(expenses);
    }

    [HttpGet("user/{userId}")]
    public async Task<IActionResult> GetExpensesByUserId(int userId, [FromQuery] int? year = null,
        [FromQuery] int? month = null)
    {
        _ = new List<ExpenseDto>();
        List<ExpenseDto> userExpenses;
        if (year != null && month != null)
            userExpenses = await service.GetUserExpensesByParamsAsync(userId, year.Value, month.Value);
        else
            userExpenses = await service.GetExpensesByUserId(userId);

        if (!userExpenses.Any()) return NoContent();
        return Ok(userExpenses);
    }

    [HttpGet("user/{userId}/category/{categoryId}")]
    public async Task<IActionResult> GetUserExpensesByCategory(int userId, int categoryId)
    {
        var userExpensesByCategory = await service.GetExpensesByUserIdAndCategoryId(userId, categoryId);
        if (!userExpensesByCategory.Any()) return NoContent();
        return Ok(userExpensesByCategory);
    }

    [HttpGet("{expenseId}")]
    public async Task<IActionResult> Get(int expenseId)
    {
        var expense = await service.GetExpenseByIdAsync(expenseId);
        if (expense == null) return NotFound($"No expense found with id: {expenseId} !");
        return Ok(expense);
    }

    [HttpGet("{userId}/[action]")]
    public async Task<IActionResult> GetUserYearlyExpenses(int userId, [FromQuery] int year)
    {
        try
        {
            var userExpenses = await service.GetUserYearlyExpensesAsync(userId, year);
            if (!userExpenses.Any()) return NoContent();
            return Ok(userExpenses);
        }
        catch (Exception e)
        {
            logger.LogError(e, $"Something Went Wrong in {nameof(GetUserYearlyExpenses)}");
            return BadRequest(e.Message);
        }
    }

    [HttpPost]
    public async Task<IActionResult> CreateExpense(ExpenseDto expenseDto)
    {
        try
        {
            var newExpense = await service.InsertExpenseAsync(expenseDto);
            return Ok(newExpense);
        }
        catch (Exception e)
        {
            logger.LogError(e, $"Something Went Wrong in {nameof(CreateExpense)}");
            return BadRequest(e.Message);
        }
    }

    [HttpPut("{expenseId}")]
    public async Task<IActionResult> UpdateExpense(int expenseId, ExpenseDto expenseDto)
    {
        try
        {
            if (expenseId != expenseDto.Id) return BadRequest("Error with Id!");
            var expenseToUpdate = await service.UpdateExpenseAsync(expenseId, expenseDto);
            if (expenseToUpdate == null) return BadRequest("Expense could not be updated!");
            return Ok(expenseToUpdate);
        }
        catch (Exception e)
        {
            logger.LogError(e, $"Something Went Wrong in {nameof(UpdateExpense)}");
            return BadRequest(e.Message);
        }
    }

    [HttpDelete("{expenseId}")]
    public async Task<IActionResult> DeleteExpense(int expenseId)
    {
        try
        {
            var checkDelete = await service.DeleteExpenseByIdAsync(expenseId);
            if (!checkDelete) return BadRequest($"Expense with id: {expenseId} could not be deleted!");
            return Ok(true);
        }
        catch (Exception e)
        {
            logger.LogError(e, $"Something Went Wrong in {nameof(DeleteExpense)}");
            return BadRequest(e.Message);
        }
    }
}