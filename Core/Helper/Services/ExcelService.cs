using ClosedXML.Excel;
using Core.DTOs;
using Core.Helper.Classes;

namespace Core.Helper.Services
{
    public static class ExcelService
    {
        public static XLWorkbook CreateYearlyExcelReport(int year, List<ExpenseDto> expenses)
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

            var workbook = new XLWorkbook();
            // Style Header
            var worksheet = workbook.Worksheets.Add($"Ausgaben {year}");
            worksheet.PageSetup.PageOrientation = XLPageOrientation.Landscape;
            var header = worksheet.Cell(1, 1);
            header.Value = $"Ausgaben {year}";
            header.Style.Font.FontSize = 18;
            header.Style.Font.SetBold();
            worksheet.Cell(2, 1).Value = "";
            worksheet.Cell(2, 1).WorksheetRow().Height = 30;
            worksheet.Column("A").Width = 50;
            worksheet.Column("B").Width = 20;
            worksheet.Column("C").Width = 20;
            worksheet.Column("D").Width = 20;
            worksheet.Rows().Style.Alignment.SetHorizontal(XLAlignmentHorizontalValues.Center);

            // Start on row 3
            var row = 3;
            
            foreach (var month in statistic.StatisticMonths)
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
                worksheet.Row(row).Style.Fill.SetBackgroundColor(XLColor.LightGray);

                row++;
                worksheet.Cell(row, 1).Style.Font.SetFontSize(12);
                worksheet.Cell(row, 1).SetValue(GetMonthName(month.Month));
                worksheet.Cell(row, 2).Style.Font.SetFontSize(12);
                worksheet.Cell(row, 2).SetValue($"{month.MonthAmount:0.00}");

                foreach (var category in month.StatisticCategories)
                {
                    worksheet.Cell(row, 3).SetValue(category.CategoryName);
                    worksheet.Cell(row, 4).SetValue($"{category.CategoryAmount:0.00}");
                    row++;
                }

                worksheet.Cell(row, 1).WorksheetRow().Height = 20;
                worksheet.Cell(row, 2).WorksheetRow().Height = 20;
                row++;

            }
            
            row++;
            worksheet.Cell(row, 1).SetValue($"Total {year}");
            worksheet.Cell(row, 1).Style.Font.SetFontSize(18).Font.SetBold();
            worksheet.Cell(row, 1).Style.Fill.BackgroundColor = XLColor.LightGray;

            row++;
            worksheet.Cell(row, 1).SetValue("CHF");
            worksheet.Cell(row, 1).Style.Font.SetFontSize(16).Font.SetBold();
            worksheet.Cell(row, 2).SetValue($"{statistic.TotalSum:0.00}");
            worksheet.Cell(row, 2).Style.Font.SetFontSize(16).Font.SetBold();
            row++;
            row++;

            var categoryWithAmount = new Dictionary<string, decimal>();
            foreach (var category in statistic.StatisticMonths.SelectMany(month => month.StatisticCategories))
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
                row++;
            }


            return workbook;
        }

        public static XLWorkbook CreateMonthlyExcelReport(int year, int month, List<ExpenseDto> expenses)
        {
            var workbook = new XLWorkbook();
            var worksheet = workbook.Worksheets.Add($"Detail Statistik für {month} {year}");

            return workbook;
        }

        private static string GetMonthName(int month)
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
