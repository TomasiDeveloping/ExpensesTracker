using Core.DTOs;
using Core.Interfaces;

namespace Core.Helper.Services;

public class CronService : ICronService
{
    private readonly IExpenseService _expenseService;
    private readonly IRecurringTaskService _recurringTaskService;
    private readonly IRevenueService _revenueService;
    private readonly DateTime _today = DateTime.Now;

    public CronService(IRecurringTaskService recurringTaskService, IRevenueService revenueService,
        IExpenseService expenseService)
    {
        _recurringTaskService = recurringTaskService;
        _revenueService = revenueService;
        _expenseService = expenseService;
    }

    public async Task<bool> CreateRecurringTasks()
    {
        var activeRecurringTasks = await _recurringTaskService.GetAllActiveRecurringTasks();
        if (!activeRecurringTasks.Any()) return true;

        foreach (var recurringTask in activeRecurringTasks.Where(CheckIfJobMustRun))
        {
            if (recurringTask.IsExpense)
            {
                var checkInsert = await InsertExpense(recurringTask);
                if (!checkInsert) return false;
                recurringTask.LastExecution = _today;
                recurringTask.NextExecution = _today.AddMonths(recurringTask.ExecuteInMonths);
                await _recurringTaskService.UpdateRecurringTaskAsync(recurringTask);
            }
            else
            {
                var checkInsert = await InsertRevenue(recurringTask);
                if (!checkInsert) return false;
                recurringTask.LastExecution = _today;
                recurringTask.NextExecution = _today.AddMonths(recurringTask.ExecuteInMonths);
                await _recurringTaskService.UpdateRecurringTaskAsync(recurringTask);
            }
        }

        return true;
    }

    private bool CheckIfJobMustRun(RecurringTaskDto recurringTaskDto)
    {
        var dateToCheck = recurringTaskDto.LastExecution.AddMonths(recurringTaskDto.ExecuteInMonths);

        return dateToCheck.Day.Equals(_today.Day) && dateToCheck.Month.Equals(_today.Month) &&
               dateToCheck.Year.Equals(_today.Year);
    }

    private async Task<bool> InsertExpense(RecurringTaskDto recurringTaskDto)
    {
        try
        {
            if (recurringTaskDto.CategoryId.Equals(null)) throw new ArgumentException("CategoryId is null!");
            var newExpense = new ExpenseDto
            {
                Amount = recurringTaskDto.Amount,
                CategoryId = recurringTaskDto.CategoryId.Value,
                CreateDate = _today,
                Description = recurringTaskDto.Description,
                UserId = recurringTaskDto.UserId
            };
            await _expenseService.InsertExpenseAsync(newExpense);
            return true;
        }
        catch (Exception e)
        {
            throw new ArgumentException(e.Message);
        }
    }

    private async Task<bool> InsertRevenue(RecurringTaskDto recurringTaskDto)
    {
        try
        {
            if (recurringTaskDto.RevenueCategoryId.Equals(null)) throw new ArgumentException("CategoryId is null!");
            var newRevenue = new RevenueDto
            {
                Amount = recurringTaskDto.Amount,
                RevenueCategoryId = recurringTaskDto.RevenueCategoryId.Value,
                CreateDate = _today,
                Description = recurringTaskDto.Description,
                UserId = recurringTaskDto.UserId
            };
            await _revenueService.InsertRevenueAsync(newRevenue);
            return true;
        }
        catch (Exception e)
        {
            throw new ArgumentException(e.Message);
        }
    }
}