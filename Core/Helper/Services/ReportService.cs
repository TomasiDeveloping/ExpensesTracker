using ClosedXML.Excel;
using Core.Helper.Classes;
using Core.Interfaces;

namespace Core.Helper.Services;

public class ReportService(IExpenseService expenseService, IRevenueService revenueService, IUserService userService) : IReportService
{
    public async Task<XLWorkbook> CreateYearlyExcelReportAsync(Report report)
    {
        var user = await userService.GetUserByIdAsync(report.UserId);
        if (user == null) throw new ArgumentException("No user found!");
        var userExpenses = await expenseService.GetExpensesForYearlyReportAsync(report);
        var userRevenues = await revenueService.GetRevenuesForYearlyReportAsync(report);
        var workbook =
            ExcelService.CreateYearlyExcelReport(report.Year, userExpenses, userRevenues, user.WithRevenue);
        return workbook;
    }

    public async Task<XLWorkbook> CreateMonthlyExcelReportAsync(Report report)
    {
        var user = await userService.GetUserByIdAsync(report.UserId);
        if (user == null) throw new ArgumentException("No user found!");
        var userExpenses = await expenseService.GetExpensesForMonthlyReportAsync(report);
        var userRevenues = await revenueService.GetRevenuesForMonthlyReportAsync(report);
        var workbook = ExcelService.CreateMonthlyExcelReport(report.Year, report.Month, userExpenses, userRevenues,
            user.WithRevenue);
        return workbook;
    }
}