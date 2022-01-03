using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace Core.DTOs
{
    public class RevenueDto
    {
        public int Id { get; set; }
        public int UserId { get; set; }
        public string CategoryName { get; set; }
        public int RevenueCategoryId { get; set; }
        public string Description { get; set; }
        public decimal Amount { get; set; }
        public DateTime CreateDate { get; set; }
    }
}
