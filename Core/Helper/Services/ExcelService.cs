using ClosedXML.Excel;
using Core.DTOs;
using Core.Helper.Classes;

namespace Core.Helper.Services
{
    public static class ExcelService
    {
        public static XLWorkbook CreateYearlyExcelReport(int year, List<ExpenseDto> expenses, List<RevenueDto> revenues, bool isWithRevenue)
        {
            var expenseStatistic = CreateStatisticModel(expenses);
            var revenueStatistic = CreateStatisticRevenueModel(revenues);

            var workbook = new XLWorkbook();
            // Style Header
            var worksheet = workbook.Worksheets.Add($"Statistik {year}");
            worksheet.PageSetup.PageOrientation = XLPageOrientation.Landscape;
            var header = worksheet.Cell(1, 1);
            header.Value = $"Statistik {year}";
            header.Style.Font.FontSize = 18;
            header.Style.Font.SetBold();
            worksheet.Cell(2, 1).Value = "";
            worksheet.Cell(2, 1).WorksheetRow().Height = 30;
            worksheet.Column("A").Width = 50;
            worksheet.Column("B").Width = 20;
            worksheet.Column("C").Width = 20;
            worksheet.Column("D").Width = 20;
            worksheet.Column("E").Width = 20;
            worksheet.Column("F").Width = 20;
            worksheet.Column("G").Width = 20;
            worksheet.Column("H").Width = 20;
            worksheet.Rows().Style.Alignment.SetHorizontal(XLAlignmentHorizontalValues.Center);

            // Start on row 3
            var row = 3;
            var endRow = 0;

            for (var i = 1; i<= 12; i++)
            {
                worksheet.Cell(row, 1).SetValue("Monat");
                worksheet.Cell(row, 1).Style.Font.SetBold();
                worksheet.Cell(row, 2).SetValue("Total Ausgaben");
                worksheet.Cell(row, 2).Style.Font.SetBold();
                worksheet.Row(row).Style.Font.FontSize = 12;
                worksheet.Cell(row, 3).SetValue("Kategorie");
                worksheet.Cell(row, 3).Style.Font.SetBold();
                worksheet.Cell(row, 4).SetValue("Ausgaben");
                worksheet.Cell(row, 4).Style.Font.SetBold();

                if (isWithRevenue)
                {
                    worksheet.Cell(row, 5).SetValue("");
                    worksheet.Cell(row, 5).Style.Font.SetBold();
                    worksheet.Cell(row, 6).SetValue("Total Einnahmen");
                    worksheet.Cell(row, 6).Style.Font.SetBold();
                    worksheet.Cell(row, 7).SetValue("Kategorie");
                    worksheet.Cell(row, 7).Style.Font.SetBold();
                    worksheet.Cell(row, 8).SetValue("Einnahmen");
                    worksheet.Cell(row, 8).Style.Font.SetBold();
                }
      
                worksheet.Row(row).Style.Fill.SetBackgroundColor(XLColor.LightGray);

                row++;
                var expenseMonth = expenseStatistic.StatisticMonths.FirstOrDefault(m => m.Month == i);
                var revenueMonth = new StatisticMonth();
                if (isWithRevenue)
                {
                    revenueMonth = revenueStatistic.StatisticMonths.FirstOrDefault(r => r.Month == i);
                }
                worksheet.Cell(row, 1).Style.Font.SetFontSize(12);
                worksheet.Cell(row, 1).SetValue(GetMonthName(i));

                switch (expenseMonth)
                {
                    case null when !isWithRevenue:
                        row++;
                        worksheet.Cell(row, 1).SetValue("");
                        row++;
                        continue;
                    case null when revenueMonth == null:
                        row++;
                        worksheet.Cell(row, 1).SetValue("");
                        row++;
                        continue;
                }


                var startRow = row;
                if (expenseMonth != null)
                {
                    worksheet.Cell(row, 2).Style.Font.SetFontSize(12);
                    worksheet.Cell(row, 2).SetValue($"{expenseMonth.MonthAmount:0.00}");

                    foreach (var category in expenseMonth.StatisticCategories)
                    {
                        worksheet.Cell(row, 3).SetValue(category.CategoryName);
                        worksheet.Cell(row, 4).SetValue($"{category.CategoryAmount:0.00}");
                        row++;
                    }

                    endRow = row;
                }
 
   
                if (isWithRevenue)
                {
                    if (revenueMonth != null)
                    {
                        worksheet.Cell(startRow, 6).Style.Font.SetFontSize(12);
                        worksheet.Cell(startRow, 6).SetValue($"{revenueMonth.MonthAmount:0.00}");
                        foreach (var category in revenueMonth.StatisticCategories)
                        {
                            worksheet.Cell(startRow, 7).SetValue(category.CategoryName);
                            worksheet.Cell(startRow, 8).SetValue($"{category.CategoryAmount:0.00}");
                            startRow++;
                        }
                    }
      
                }

                row = endRow < startRow ? startRow : endRow;

                if (isWithRevenue)
                {
                    worksheet.Cell(row, 1).SetValue($"Differenz {GetMonthName(i)}");
                    worksheet.Row(row).Style.Font.SetBold().Font.SetFontSize(12).Fill.SetBackgroundColor(XLColor.LightGray);
                    decimal revenueAmount = 0;
                    decimal expenseAmount = 0;
                    if (revenueMonth != null) revenueAmount = revenueMonth.MonthAmount;
                    if (expenseMonth != null) expenseAmount = expenseMonth.MonthAmount;
                    var dif = revenueAmount - expenseAmount;
                    worksheet.Cell(row, 2).SetValue($"{dif:0.00}");
                    worksheet.Cell(row, 2).Style.Font.SetFontColor(XLColor.DarkPastelGreen);
                    if (dif < 0) worksheet.Cell(row, 2).Style.Font.SetFontColor(XLColor.TractorRed);
                    row++;
                }

                worksheet.Cell(row, 1).WorksheetRow().Height = 20;
                worksheet.Cell(row, 2).WorksheetRow().Height = 20;
                row++;
            }


            row++;
            worksheet.Cell(row, 1).SetValue($"Total {year}");
            worksheet.Cell(row, 1).Style.Font.SetFontSize(18).Font.SetBold();
            worksheet.Cell(row, 2).SetValue($"Ausgaben");
            worksheet.Cell(row, 2).Style.Font.SetFontSize(18).Font.SetBold();

            if (isWithRevenue)
            {
                worksheet.Cell(row, 4).SetValue($"Einnahmen");
                worksheet.Cell(row, 4).Style.Font.SetFontSize(18).Font.SetBold();
                worksheet.Cell(row, 6).SetValue($"Differenz");
                worksheet.Cell(row, 6).Style.Font.SetFontSize(18).Font.SetBold();
            }

            worksheet.Row(row).Style.Fill.SetBackgroundColor(XLColor.LightGray);

            row++;
            worksheet.Cell(row, 1).SetValue("CHF");
            worksheet.Cell(row, 1).Style.Font.SetFontSize(16).Font.SetBold();
            worksheet.Cell(row, 2).SetValue($"{expenseStatistic.TotalSum:0.00}");
            worksheet.Cell(row, 2).Style.Font.SetFontSize(16).Font.SetBold();
            if (isWithRevenue)
            {
                worksheet.Cell(row, 4).SetValue($"{revenueStatistic.TotalSum:0.00}");
                worksheet.Cell(row, 4).Style.Font.SetFontSize(16).Font.SetBold();
                var totalDiff = revenueStatistic.TotalSum - expenseStatistic.TotalSum;
                worksheet.Cell(row, 6).SetValue($"{totalDiff:0.00}");
                worksheet.Cell(row, 6).Style.Font.SetFontSize(16).Font.SetBold().Font.SetFontColor(XLColor.DarkPastelGreen);
                if (totalDiff < 0) worksheet.Cell(row, 6).Style.Font.SetFontColor(XLColor.TractorRed);
            }
            row++;
            worksheet.Row(row).Style.Fill.SetBackgroundColor(XLColor.LightGray);
            row++;
            worksheet.Cell(row, 1).SetValue("Ausgaben");
            worksheet.Cell(row, 1).Style.Font.SetFontSize(14).Font.SetBold().Font.SetFontColor(XLColor.TractorRed);
            row++;

            var categoryWithAmount = new Dictionary<string, decimal>();
            foreach (var category in expenseStatistic.StatisticMonths.SelectMany(month => month.StatisticCategories))
            {
                if (categoryWithAmount.ContainsKey(category.CategoryName))
                {
                    categoryWithAmount[category.CategoryName] += category.CategoryAmount;
                }
                else
                {
                    categoryWithAmount.Add(category.CategoryName, category.CategoryAmount);
                }
            }

            foreach (var (key, value) in categoryWithAmount)
            {
                worksheet.Cell(row, 1).Style.Font.SetFontSize(12).Font.SetBold();
                worksheet.Cell(row, 1).SetValue(key);
                worksheet.Cell(row, 2).Style.Font.SetFontSize(12).Font.SetBold();
                worksheet.Cell(row, 2).SetValue($"{value:0.00}");
                worksheet.Cell(row, 3).Style.Font.SetFontSize(12).Font.SetBold();
                worksheet.Cell(row, 3).SetValue($"{((100 / expenseStatistic.TotalSum) * value):0.00}%");
                row++;
            }

            if (!isWithRevenue) return workbook;
            {
                worksheet.Row(row).Style.Fill.SetBackgroundColor(XLColor.LightGray);
                row++;
                worksheet.Cell(row, 1).SetValue("Einnahmen");
                worksheet.Cell(row, 1).Style.Font.SetFontSize(14).Font.SetBold().Font.SetFontColor(XLColor.DarkPastelGreen);
                row++;

                var revenueWithAmount = new Dictionary<string, decimal>();
                foreach (var category in revenueStatistic.StatisticMonths.SelectMany(month => month.StatisticCategories))
                {
                    if (revenueWithAmount.ContainsKey(category.CategoryName))
                    {
                        revenueWithAmount[category.CategoryName] += category.CategoryAmount;
                    }
                    else
                    {
                        revenueWithAmount.Add(category.CategoryName, category.CategoryAmount);
                    }
                }

                foreach (var (key, value) in revenueWithAmount)
                {
                    worksheet.Cell(row, 1).Style.Font.SetFontSize(12).Font.SetBold();
                    worksheet.Cell(row, 1).SetValue(key);
                    worksheet.Cell(row, 2).Style.Font.SetFontSize(12).Font.SetBold();
                    worksheet.Cell(row, 2).SetValue($"{value:0.00}");
                    worksheet.Cell(row, 3).Style.Font.SetFontSize(12).Font.SetBold();
                    worksheet.Cell(row, 3).SetValue($"{((100 / revenueStatistic.TotalSum) * value):0.00}%");
                    row++;
                }
            }

            return workbook;
        }

        public static XLWorkbook CreateMonthlyExcelReport(int year, int month, List<ExpenseDto> expenses, List<RevenueDto> revenues, bool isWithRevenue)
        {
            var expenseStatistic = CreateStatisticModel(expenses);
            var revenueStatistic = CreateStatisticRevenueModel(revenues);

            var workbook = new XLWorkbook();
            // Style Header
            var worksheet = workbook.Worksheets.Add($"Statistik {GetMonthName(month)} {year}");
            worksheet.PageSetup.PageOrientation = XLPageOrientation.Landscape;
            var header = worksheet.Cell(1, 1);
            header.Value = $"Statistik {GetMonthName(month)} {year}";
            header.Style.Font.FontSize = 18;
            header.Style.Font.SetBold();
            worksheet.Cell(2, 1).Value = "";
            worksheet.Cell(2, 1).WorksheetRow().Height = 30;
            worksheet.Column("A").Width = 50;
            worksheet.Column("B").Width = 20;
            worksheet.Column("C").Width = 20;
            worksheet.Column("D").Width = 20;
            worksheet.Column("E").Width = 20;
            worksheet.Column("F").Width = 20;
            worksheet.Rows().Style.Alignment.SetHorizontal(XLAlignmentHorizontalValues.Center);

            // Start on row 3
            var row = 3;

            worksheet.Cell(row, 1).SetValue("Monat");
            worksheet.Cell(row, 1).Style.Font.SetBold();
            worksheet.Cell(row, 2).SetValue("Total Ausgaben");
            worksheet.Cell(row, 2).Style.Font.SetBold();
            worksheet.Row(row).Style.Font.FontSize = 12;
            worksheet.Cell(row, 3).SetValue("Kategorie");
            worksheet.Cell(row, 3).Style.Font.SetBold();
            worksheet.Cell(row, 4).SetValue("Beschreibung");
            worksheet.Cell(row, 4).Style.Font.SetBold();
            worksheet.Cell(row, 5).SetValue("CHF");
            worksheet.Cell(row, 5).Style.Font.SetBold();
            worksheet.Cell(row, 6).SetValue("Datum");
            worksheet.Cell(row, 6).Style.Font.SetBold();
            worksheet.Row(row).Style.Fill.SetBackgroundColor(XLColor.LightGray);

            row++;
            worksheet.Cell(row, 1).Style.Font.SetFontSize(12);
            worksheet.Cell(row, 1).SetValue(GetMonthName(month));
            worksheet.Cell(row, 2).Style.Font.SetFontSize(12);
            worksheet.Cell(row, 2).SetValue($"{expenseStatistic.TotalSum:0.00}");

            if (!expenses.Any()) row++;

            foreach (var expense in expenses)
            {
                worksheet.Cell(row, 3).SetValue(expense.CategoryName);
                worksheet.Cell(row, 4).SetValue(expense.Description);
                worksheet.Cell(row, 5).SetValue($"{expense.Amount:0.00}");
                worksheet.Cell(row, 6).SetValue($"{expense.CreateDate:dd.MM.yyyy}");
                row++;
            }

            if (isWithRevenue)
            {
                worksheet.Row(row).Style.Fill.SetBackgroundColor(XLColor.LightGray);
                row++;
                row++;
                worksheet.Cell(row, 2).SetValue("Total Einnahmen");
                worksheet.Cell(row, 2).Style.Font.SetBold();
                worksheet.Row(row).Style.Font.FontSize = 12;
                worksheet.Cell(row, 3).SetValue("Kategorie");
                worksheet.Cell(row, 3).Style.Font.SetBold();
                worksheet.Cell(row, 4).SetValue("Beschreibung");
                worksheet.Cell(row, 4).Style.Font.SetBold();
                worksheet.Cell(row, 5).SetValue("CHF");
                worksheet.Cell(row, 5).Style.Font.SetBold();
                worksheet.Cell(row, 6).SetValue("Datum");
                worksheet.Cell(row, 6).Style.Font.SetBold();
                worksheet.Row(row).Style.Fill.SetBackgroundColor(XLColor.LightGray);

                row++;
                worksheet.Cell(row, 2).Style.Font.SetFontSize(12);
                worksheet.Cell(row, 2).SetValue($"{revenueStatistic.TotalSum:0.00}");

                if (!revenues.Any()) row++;

                foreach (var revenue in revenues)
                {
                    worksheet.Cell(row, 3).SetValue(revenue.CategoryName);
                    worksheet.Cell(row, 4).SetValue(revenue.Description);
                    worksheet.Cell(row, 5).SetValue($"{revenue.Amount:0.00}");
                    worksheet.Cell(row, 6).SetValue($"{revenue.CreateDate:dd.MM.yyyy}");
                    row++;
                }

                worksheet.Row(row).Style.Fill.SetBackgroundColor(XLColor.LightGray);
                row++;
            }

            row++;
            worksheet.Cell(row, 1).SetValue($"{GetMonthName(month)} {year}");
            worksheet.Cell(row, 1).Style.Font.SetFontSize(18).Font.SetBold();
            worksheet.Row(row).Style.Fill.SetBackgroundColor(XLColor.LightGray);
            worksheet.Cell(row, 2).SetValue("Ausgaben");
            worksheet.Cell(row, 2).Style.Font.SetFontSize(18).Font.SetBold();
            //worksheet.Cell(row, 2).Style.Fill.BackgroundColor = XLColor.LightGray;
            if (isWithRevenue)
            {
                worksheet.Cell(row, 3).SetValue("Einnahmen");
                worksheet.Cell(row, 3).Style.Font.SetFontSize(18).Font.SetBold();
                //worksheet.Cell(row, 3).Style.Fill.BackgroundColor = XLColor.LightGray;
                worksheet.Cell(row, 4).SetValue("Differenz");
                worksheet.Cell(row, 4).Style.Font.SetFontSize(18).Font.SetBold();
                //worksheet.Cell(row, 4).Style.Fill.BackgroundColor = XLColor.LightGray;
            }

            row++;
            worksheet.Cell(row, 1).SetValue("CHF");
            worksheet.Cell(row, 1).Style.Font.SetFontSize(16).Font.SetBold();
            worksheet.Cell(row, 2).SetValue($"{expenseStatistic.TotalSum:0.00}");
            worksheet.Cell(row, 2).Style.Font.SetFontSize(16).Font.SetBold().Font.SetFontColor(XLColor.TractorRed);

            if (isWithRevenue)
            {
                worksheet.Cell(row, 3).SetValue($"{revenueStatistic.TotalSum:0.00}");
                worksheet.Cell(row, 3).Style.Font.SetFontSize(16).Font.SetBold().Font.SetFontColor(XLColor.DarkPastelGreen);
                var diff = revenueStatistic.TotalSum - expenseStatistic.TotalSum;
                worksheet.Cell(row, 4).SetValue($"{diff:0.00}");
                worksheet.Cell(row, 4).Style.Font.SetFontSize(16).Font.SetBold().Font.SetFontColor(XLColor.DarkPastelGreen);
                if (diff < 0) worksheet.Cell(row, 4).Style.Font.SetFontColor(XLColor.TractorRed);
            }
            row++;
            worksheet.Row(row).Style.Fill.SetBackgroundColor(XLColor.LightGray);
            row++;
            worksheet.Cell(row, 1).SetValue("Ausgaben nach Kategorie").Style.Font.SetFontColor(XLColor.TractorRed).Font.SetBold().Font.SetFontSize(12);
            row++;

            foreach (var category in expenseStatistic.StatisticMonths.SelectMany(statisticMonth => statisticMonth.StatisticCategories))
            {
                worksheet.Cell(row, 1).Style.Font.SetFontSize(12).Font.SetBold();
                worksheet.Cell(row, 1).SetValue(category.CategoryName);
                worksheet.Cell(row, 2).Style.Font.SetFontSize(12).Font.SetBold();
                worksheet.Cell(row, 2).SetValue($"{category.CategoryAmount:0.00}");
                worksheet.Cell(row, 3).Style.Font.SetFontSize(12).Font.SetBold();
                worksheet.Cell(row, 3).SetValue($"{((100 / expenseStatistic.TotalSum) * category.CategoryAmount):0.00}%");
                row++;
            }

            if (!isWithRevenue) return workbook;
            row++;
            worksheet.Cell(row, 1).SetValue("Einnahmen nach Kategorie").Style.Font.SetFontColor(XLColor.DarkPastelGreen).Font.SetBold().Font.SetFontSize(12);
            row++;

            foreach (var category in revenueStatistic.StatisticMonths.SelectMany(statisticMonth => statisticMonth.StatisticCategories))
            {
                worksheet.Cell(row, 1).Style.Font.SetFontSize(12).Font.SetBold();
                worksheet.Cell(row, 1).SetValue(category.CategoryName);
                worksheet.Cell(row, 2).Style.Font.SetFontSize(12).Font.SetBold();
                worksheet.Cell(row, 2).SetValue($"{category.CategoryAmount:0.00}");
                worksheet.Cell(row, 3).Style.Font.SetFontSize(12).Font.SetBold();
                worksheet.Cell(row, 3).SetValue($"{((100 / revenueStatistic.TotalSum) * category.CategoryAmount):0.00}%");
                row++;
            }

            return workbook;
        }

        private static Statistic CreateStatisticModel(List<ExpenseDto> expenses)
        {
            var statistic = new Statistic();

            foreach (var expense in expenses)
            {
                var currentMonth = expense.CreateDate.Month;
                if (statistic.StatisticMonths.Any(e => e.Month == currentMonth))
                {
                    var month = statistic.StatisticMonths.First(e => e.Month == currentMonth);
                    if (month.StatisticCategories.Any(c => c.CategoryId == expense.CategoryId))
                    {
                        var category =
                            month.StatisticCategories.First(c => c.CategoryId == expense.CategoryId);
                        category.CategoryAmount += expense.Amount;
                    }
                    else
                    {
                        month.StatisticCategories.Add(new StatisticCategory()
                        {
                            CategoryAmount = expense.Amount,
                            CategoryId = expense.CategoryId,
                            CategoryName = expense.CategoryName
                        });
                    }

                    month.MonthAmount += expense.Amount;
                }
                else
                {
                    var statisticCategory = new StatisticCategory()
                    {
                        CategoryAmount = expense.Amount,
                        CategoryId = expense.CategoryId,
                        CategoryName = expense.CategoryName
                    };
                    var statisticMonth = new StatisticMonth()
                    {
                        StatisticCategories = new List<StatisticCategory>(),
                        MonthAmount = expense.Amount,
                        Month = currentMonth
                    };
                    statisticMonth.StatisticCategories.Add(statisticCategory);

                    statistic.StatisticMonths.Add(statisticMonth);
                }

                statistic.TotalSum += expense.Amount;
            }

            return statistic;
        }
        private static Statistic CreateStatisticRevenueModel(List<RevenueDto> revenues)
        {
            var statistic = new Statistic();

            foreach (var revenue in revenues)
            {
                var currentMonth = revenue.CreateDate.Month;
                if (statistic.StatisticMonths.Any(e => e.Month == currentMonth))
                {
                    var month = statistic.StatisticMonths.First(e => e.Month == currentMonth);
                    if (month.StatisticCategories.Any(c => c.CategoryId == revenue.RevenueCategoryId))
                    {
                        var category =
                            month.StatisticCategories.First(c => c.CategoryId == revenue.RevenueCategoryId);
                        category.CategoryAmount += revenue.Amount;
                    }
                    else
                    {
                        month.StatisticCategories.Add(new StatisticCategory()
                        {
                            CategoryAmount = revenue.Amount,
                            CategoryId = revenue.RevenueCategoryId,
                            CategoryName = revenue.CategoryName
                        });
                    }

                    month.MonthAmount += revenue.Amount;
                }
                else
                {
                    var statisticCategory = new StatisticCategory()
                    {
                        CategoryAmount = revenue.Amount,
                        CategoryId = revenue.RevenueCategoryId,
                        CategoryName = revenue.CategoryName
                    };
                    var statisticMonth = new StatisticMonth()
                    {
                        StatisticCategories = new List<StatisticCategory>(),
                        MonthAmount = revenue.Amount,
                        Month = currentMonth
                    };
                    statisticMonth.StatisticCategories.Add(statisticCategory);

                    statistic.StatisticMonths.Add(statisticMonth);
                }

                statistic.TotalSum += revenue.Amount;
            }

            return statistic;
        }

        public static string GetMonthName(int month)
        {
            return month switch
            {
                1 => "Januar",
                2 => "Februar",
                3 => "März",
                4 => "April",
                5 => "Mai",
                6 => "Juni",
                7 => "Juli",
                8 => "August",
                9 => "September",
                10 => "Oktober",
                11 => "November",
                12 => "Dezember",
                _ => "Unbekannt"
            };
        }
    }
}