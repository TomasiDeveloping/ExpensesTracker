﻿using Core.DTOs;
using Core.Interfaces;

namespace Core.Helper.Services;

public class CronService(IRecurringTaskService recurringTaskService, IRevenueService revenueService,
    IExpenseService expenseService) : ICronService
{
    private readonly DateTime _today = DateTime.Now;

    public async Task<bool> CreateRecurringTasks()
    {
        var activeRecurringTasks = await recurringTaskService.GetAllActiveRecurringTasks();
        if (!activeRecurringTasks.Any()) return true;

        foreach (var recurringTask in activeRecurringTasks.Where(CheckIfJobMustRun))
            if (recurringTask.IsExpense)
            {
                var checkInsert = await InsertExpense(recurringTask);
                if (!checkInsert) return false;
                recurringTask.LastExecution = _today;
                recurringTask.NextExecution = _today.AddMonths(recurringTask.ExecuteInMonths);
                await recurringTaskService.UpdateRecurringTaskAsync(recurringTask);
            }
            else
            {
                var checkInsert = await InsertRevenue(recurringTask);
                if (!checkInsert) return false;
                recurringTask.LastExecution = _today;
                recurringTask.NextExecution = _today.AddMonths(recurringTask.ExecuteInMonths);
                await recurringTaskService.UpdateRecurringTaskAsync(recurringTask);
            }

        return true;
    }

    private bool CheckIfJobMustRun(RecurringTaskDto recurringTaskDto)
    {
        return recurringTaskDto.NextExecution.Day.Equals(_today.Day) &&
               recurringTaskDto.NextExecution.Month.Equals(_today.Month) &&
               recurringTaskDto.NextExecution.Year.Equals(_today.Year);
    }

    private async Task<bool> InsertExpense(RecurringTaskDto recurringTaskDto)
    {
        try
        {
            if (recurringTaskDto.CategoryId.Equals(null)) throw new ArgumentException("CategoryId is null!");
            var newExpense = new ExpenseDto
            {
                Amount = recurringTaskDto.Amount,
                CategoryId = recurringTaskDto.CategoryId!.Value,
                CreateDate = _today,
                Description = recurringTaskDto.Description,
                UserId = recurringTaskDto.UserId
            };
            await expenseService.InsertExpenseAsync(newExpense);
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
                RevenueCategoryId = recurringTaskDto.RevenueCategoryId!.Value,
                CreateDate = _today,
                Description = recurringTaskDto.Description,
                UserId = recurringTaskDto.UserId
            };
            await revenueService.InsertRevenueAsync(newRevenue);
            return true;
        }
        catch (Exception e)
        {
            throw new ArgumentException(e.Message);
        }
    }
}