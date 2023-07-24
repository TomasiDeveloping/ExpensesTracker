namespace Core.Models;

public class Category
{
    public int Id { get; set; }
    public User User { get; set; }
    public int UserId { get; set; }
    public string Name { get; set; }
}