﻿namespace Core.Models;

public class User
{
    public int Id { get; set; }
    public string FirstName { get; set; }
    public string LastName { get; set; }
    public string Email { get; set; }
    public byte[] Password { get; set; }
    public byte[] Salt { get; set; }
    public DateTime CreatedAt { get; set; }
    public bool IsActive { get; set; }
    public bool WithRevenue { get; set; }
    public decimal? MonthlyBudget { get; set; }
}