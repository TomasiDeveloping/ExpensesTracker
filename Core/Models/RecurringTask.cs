namespace Core.Models;

public class RecurringTask
{
    public int Id { get; set; }
    public User User { get; set; }
    public int UserId { get; set; }
    public bool IsActive { get; set; }
    public bool IsRevenue { get; set; }
    public bool IsExpense { get; set; }
    public Category? Category { get; set; }
    public int? CategoryId { get; set; }
    public RevenueCategory? RevenueCategory { get; set; }
    public int? RevenueCategoryId { get; set; }
    public DateTime LastExecution { get; set; }
    public DateTime NextExecution { get; set; }
    public int ExecuteInMonths { get; set; }
    public decimal Amount { get; set; }
    public string? Description { get; set; }
}