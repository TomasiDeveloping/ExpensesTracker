using ClosedXML.Excel;
using Core.DTOs;
using Core.Helper.Classes;

namespace Core.Interfaces
{
    public interface IExpenseService
    {
        Task<List<ExpenseDto>> GetExpensesAsync();

        Task<ExpenseDto?> GetExpenseByIdAsync(int expenseId);

        Task<List<ExpenseDto>> GetExpensesByUserId(int userId);

        Task<List<ExpenseDto>> GetUserYearlyExpensesAsync(int userId, int year);

        Task<List<ExpenseDto>> GetUserExpensesByParamsAsync(int userId, int year, int month);

        Task<List<ExpenseDto>> GetExpensesByUserIdAndCategoryId(int userId, int categoryId);

        Task<XLWorkbook> CreateYearlyExcelReportAsync(Report report);

        Task<XLWorkbook> CreateMonthlyExcelReportAsync(Report report);

        Task<ExpenseDto> InsertExpenseAsync(ExpenseDto expenseDto);

        Task<ExpenseDto?> UpdateExpenseAsync(int expenseId, ExpenseDto expenseDto);

        Task<bool> DeleteExpenseByIdAsync(int expenseId);
    }
}