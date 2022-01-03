﻿using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace Core.Models
{
    public class RevenueCategory
    {
        public int Id { get; set; }
        public string Name { get; set; }
        public User User { get; set; }
        public int UserId { get; set; }
    }
}
