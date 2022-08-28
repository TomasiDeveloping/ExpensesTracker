namespace Core.Interfaces;

public interface ICronService
{
    Task<bool> CreateRecurringTasks();
}