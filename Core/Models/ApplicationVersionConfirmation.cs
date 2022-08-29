namespace Core.Models;

public class ApplicationVersionConfirmation
{
    public int Id { get; set; }
    public User User { get; set; }
    public int UserId { get; set; }
    public string Version { get; set; }
    public DateTime ConfirmedAt { get; set; }
}