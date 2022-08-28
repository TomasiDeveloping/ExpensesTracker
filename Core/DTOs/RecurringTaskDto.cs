﻿using Core.Models;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace Core.DTOs
{
    public class RecurringTaskDto
    {
        public int Id { get; set; }
        public int UserId { get; set; }
        public bool IsActive { get; set; }
        public bool IsRevenue { get; set; }
        public bool IsExpense { get; set; }
        public int? CategoryId { get; set; }
        public string? ExpenseCategoryName { get; set; }
        public int? RevenueCategoryId { get; set; }
        public string? RevenueCategoryName { get; set; }
        public DateTime LastExecution { get; set; }
        public DateTime NextExecution { get; set; }
        public int ExecuteAll { get; set; }
    }
}
