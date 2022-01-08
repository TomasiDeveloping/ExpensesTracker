namespace Core.Models
{
    public class Revenue
    {
        public int Id { get; set; }
        public User User { get; set; }
        public int UserId { get; set; }
        public RevenueCategory RevenueCategory { get; set; }
        public int RevenueCategoryId { get; set; }
        public string Description { get; set; }
        public decimal Amount { get; set; }
        public DateTime CreateDate { get; set; }
    }
}