﻿namespace Core.Models;

public class RevenueCategory
{
    public int Id { get; set; }
    public string Name { get; set; }
    public User User { get; set; }
    public int UserId { get; set; }
}