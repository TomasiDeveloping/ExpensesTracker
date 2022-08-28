using Core.DTOs;

namespace Core.Interfaces;

public interface IRecurringTaskService
{
    public Task<List<RecurringTaskDto>> GetRecurringTasksByUserIdAsync(int userId);
    public Task<RecurringTaskDto> InsertRecurringTaskAsync(RecurringTaskDto recurringTaskDto);
    public Task<RecurringTaskDto> UpdateRecurringTaskAsync(RecurringTaskDto recurringTaskDto);
    public Task<bool> DeleteRecurringAsync(int recurringTaskId);
}