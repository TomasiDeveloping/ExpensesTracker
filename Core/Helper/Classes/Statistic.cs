namespace Core.Helper.Classes
{
    public class Statistic
    {
        public List<StatisticMonth> StatisticMonths { get; set; } = new();
        public decimal TotalSum { get; set; }
    }

    public class StatisticMonth
    {
        public int Month { get; set; }
        public decimal MonthAmount { get; set; }
        public List<StatisticCategory> StatisticCategories { get; set; } = new();
    }

    public class StatisticCategory
    {
        public int CategoryId { get; set; }
        public string CategoryName { get; set; }
        public decimal CategoryAmount { get; set; }
    }
}