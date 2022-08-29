﻿namespace Core.DTOs
{
    public class ExpenseDto
    {
        public int Id { get; set; }
        public int UserId { get; set; }
        public string CategoryName { get; set; }
        public int CategoryId { get; set; }
        public string? Description { get; set; }
        public decimal Amount { get; set; }
        public DateTime CreateDate { get; set; }
    }
}