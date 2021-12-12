using Core.DTOs;

namespace Core.Interfaces
{
    public interface IExpenseService
    {
        Task<List<ExpenseDto>> GetExpensesAsync();

        Task<ExpenseDto?> GetExpenseByIdAsync(int expenseId);

        Task<List<ExpenseDto>> GetExpensesByUserId(int userId);

        Task<List<ExpenseDto>> GetExpensesByUserIdAndCategoryId(int userId, int categoryId);

        Task<ExpenseDto> InsertExpenseAsync(ExpenseDto expenseDto);

        Task<ExpenseDto?> UpdateExpenseAsync(int expenseId, ExpenseDto expenseDto);

        Task<bool> DeleteExpenseByIdAsync(int expenseId);
    }
}