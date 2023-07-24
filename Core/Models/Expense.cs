namespace Core.Models;

public class Expense
{
    public int Id { get; set; }
    public User User { get; set; }
    public int UserId { get; set; }
    public Category Category { get; set; }
    public int CategoryId { get; set; }
    public string Description { get; set; }
    public decimal Amount { get; set; }
    public DateTime CreateDate { get; set; }
}