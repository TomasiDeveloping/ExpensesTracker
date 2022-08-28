using AutoMapper;
using Core.DTOs;
using Core.Interfaces;
using Core.Models;
using Microsoft.EntityFrameworkCore;

namespace DataBase.Services;

public class RecurringTaskService : IRecurringTaskService
{
    private readonly ExpensesTrackerContext _context;
    private readonly IMapper _mapper;

    public RecurringTaskService(ExpensesTrackerContext context, IMapper mapper)
    {
        _context = context;
        _mapper = mapper;
    }

    public async Task<List<RecurringTaskDto>> GetRecurringTasksByUserIdAsync(int userId)
    {
        var recurringTasks = await _context.RecurringTasks
            .Include(rt => rt.Category)
            .Include(rt => rt.RevenueCategory)
            .AsNoTracking()
            .Where(rt => rt.UserId.Equals(userId))
            .ToListAsync();
        return _mapper.Map<List<RecurringTaskDto>>(recurringTasks);
    }

    public async Task<RecurringTaskDto> InsertRecurringTaskAsync(RecurringTaskDto recurringTaskDto)
    {
        var newRecurringTask = _mapper.Map<RecurringTask>(recurringTaskDto);
        await _context.RecurringTasks.AddAsync(newRecurringTask);
        await _context.SaveChangesAsync();
        return _mapper.Map<RecurringTaskDto>(newRecurringTask);
    }

    public async Task<RecurringTaskDto> UpdateRecurringTaskAsync(RecurringTaskDto recurringTaskDto)
    {
        var recurringTaskToUpdate =
            await _context.RecurringTasks.FirstOrDefaultAsync(rt => rt.Id.Equals(recurringTaskDto.Id));
        if (recurringTaskToUpdate == null)
            throw new ArgumentException($"No RecurringTask found with id: {recurringTaskDto.Id}");
        _mapper.Map(recurringTaskDto, recurringTaskToUpdate);
        await _context.SaveChangesAsync();
        return _mapper.Map<RecurringTaskDto>(recurringTaskToUpdate);
    }

    public async Task<bool> DeleteRecurringAsync(int recurringTaskId)
    {
        var recurringTaskToDelete =
            await _context.RecurringTasks.FirstOrDefaultAsync(rt => rt.Id.Equals(recurringTaskId));
        if (recurringTaskToDelete == null) return false;
        _context.RecurringTasks.Remove(recurringTaskToDelete);
        await _context.SaveChangesAsync();
        return true;
    }
}