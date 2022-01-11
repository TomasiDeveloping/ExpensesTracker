using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;
using ClosedXML.Excel;
using Core.Helper.Classes;
using Core.Interfaces;

namespace Core.Helper.Services
{
    public class ReportService: IReportService
    {
        private readonly IExpenseService _expenseService;
        private readonly IRevenueService _revenueService;
        private readonly IUserService _userService;

        public ReportService(IExpenseService expenseService, IRevenueService revenueService, IUserService userService)
        {
            _expenseService = expenseService;
            _revenueService = revenueService;
            _userService = userService;
        }
        public async Task<XLWorkbook> CreateYearlyExcelReportAsync(Report report)
        {
            var user = await _userService.GetUserByIdAsync(report.UserId);
            if (user == null) throw new ArgumentException("No user found!");
            var userExpenses = await _expenseService.GetExpensesForYearlyReportAsync(report);
            var userRevenues = await _revenueService.GetRevenuesForYearlyReportAsync(report);
            var workbook =
                ExcelService.CreateYearlyExcelReport(report.Year, userExpenses, userRevenues, user.WithRevenue);
            return workbook;
        }

        public async Task<XLWorkbook> CreateMonthlyExcelReportAsync(Report report)
        {
            var user = await _userService.GetUserByIdAsync(report.UserId);
            if (user == null) throw new ArgumentException("No user found!");
            var userExpenses = await _expenseService.GetExpensesForMonthlyReportAsync(report);
            var userRevenues = await _revenueService.GetRevenuesForMonthlyReportAsync(report);
            var workbook = ExcelService.CreateMonthlyExcelReport(report.Year, report.Month, userExpenses, userRevenues,
                user.WithRevenue);
            return workbook;
        }
    }
}
