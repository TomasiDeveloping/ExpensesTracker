using AutoMapper;
using Core.DTOs;
using Core.Interfaces;
using Core.Models;
using Microsoft.EntityFrameworkCore;

namespace DataBase.Services;

public class RecurringTaskService(ExpensesTrackerContext context, IMapper mapper) : IRecurringTaskService
{
    public async Task<List<RecurringTaskDto>> GetAllActiveRecurringTasks()
    {
        var activeRecurringTasks = await context.RecurringTasks
            .AsNoTracking()
            .Where(rt => rt.IsActive)
            .ToListAsync();
        return mapper.Map<List<RecurringTaskDto>>(activeRecurringTasks);
    }

    public async Task<List<RecurringTaskDto>> GetRecurringTasksByUserIdAsync(int userId)
    {
        var recurringTasks = await context.RecurringTasks
            .Include(rt => rt.Category)
            .Include(rt => rt.RevenueCategory)
            .AsNoTracking()
            .Where(rt => rt.UserId.Equals(userId))
            .ToListAsync();
        return mapper.Map<List<RecurringTaskDto>>(recurringTasks);
    }

    public async Task<RecurringTaskDto> InsertRecurringTaskAsync(RecurringTaskDto recurringTaskDto)
    {
        var newRecurringTask = mapper.Map<RecurringTask>(recurringTaskDto);
        newRecurringTask.NextExecution = newRecurringTask.LastExecution.AddMonths(newRecurringTask.ExecuteInMonths);
        await context.RecurringTasks.AddAsync(newRecurringTask);
        await context.SaveChangesAsync();
        return mapper.Map<RecurringTaskDto>(newRecurringTask);
    }

    public async Task<RecurringTaskDto> UpdateRecurringTaskAsync(RecurringTaskDto recurringTaskDto)
    {
        var recurringTaskToUpdate =
            await context.RecurringTasks.FirstOrDefaultAsync(rt => rt.Id.Equals(recurringTaskDto.Id));
        if (recurringTaskToUpdate == null)
            throw new ArgumentException($"No RecurringTask found with id: {recurringTaskDto.Id}");
        if (recurringTaskToUpdate.ExecuteInMonths != recurringTaskDto.ExecuteInMonths)
            recurringTaskDto.NextExecution =
                recurringTaskToUpdate.LastExecution.AddMonths(recurringTaskDto.ExecuteInMonths);
        mapper.Map(recurringTaskDto, recurringTaskToUpdate);
        await context.SaveChangesAsync();
        return mapper.Map<RecurringTaskDto>(recurringTaskToUpdate);
    }

    public async Task<bool> DeleteRecurringAsync(int recurringTaskId)
    {
        var recurringTaskToDelete =
            await context.RecurringTasks.FirstOrDefaultAsync(rt => rt.Id.Equals(recurringTaskId));
        if (recurringTaskToDelete == null) return false;
        context.RecurringTasks.Remove(recurringTaskToDelete);
        await context.SaveChangesAsync();
        return true;
    }
}