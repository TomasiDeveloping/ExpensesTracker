using AutoMapper;
using Core.DTOs;
using Core.Helper.Classes;
using Core.Interfaces;
using Core.Models;
using Microsoft.EntityFrameworkCore;

namespace DataBase.Services
{
    public class ExpenseService : IExpenseService
    {
        private readonly IMapper _mapper;
        private readonly ExpensesTrackerContext _context;

        public ExpenseService(IMapper mapper, ExpensesTrackerContext context)
        {
            _mapper = mapper;
            _context = context;
        }

        public async Task<List<ExpenseDto>> GetExpensesAsync()
        {
            var expenses = await _context.Expenses
                .Include(e => e.Category)
                .AsNoTracking()
                .ToListAsync();
            return _mapper.Map<List<ExpenseDto>>(expenses);
        }

        public async Task<ExpenseDto?> GetExpenseByIdAsync(int expenseId)
        {
            var expense = await _context.Expenses
                .Include(e => e.Category)
                .AsNoTracking()
                .FirstOrDefaultAsync(e => e.Id == expenseId);
            return expense == null ? null : _mapper.Map<ExpenseDto>(expense);
        }

        public async Task<List<ExpenseDto>> GetExpensesByUserId(int userId)
        {
            var userExpenses = await _context.Expenses
                .Include(e => e.Category)
                .Where(e => e.UserId == userId)
                .OrderBy(e => e.CategoryId)
                .ThenByDescending(e => e.CreateDate)
                .AsNoTracking()
                .ToListAsync();
            return _mapper.Map<List<ExpenseDto>>(userExpenses);
        }

        public async Task<List<ExpenseDto>> GetUserYearlyExpensesAsync(int userId, int year)
        {
            var startDate = new DateTime(year, 1, 1);
            var endDate = new DateTime(year, 12, 31);
            var userExpenses = await _context.Expenses
                .Include(e => e.Category)
                .Where(e => e.UserId == userId && e.CreateDate >= startDate && e.CreateDate <= endDate)
                .OrderBy(e => e.CategoryId)
                .AsNoTracking()
                .ToListAsync();
            return _mapper.Map<List<ExpenseDto>>(userExpenses);
        }

        public async Task<List<ExpenseDto>> GetUserExpensesByParamsAsync(int userId, int year, int month)
        {
            var dateFrom = new DateTime(year, month, 1);
            var dateTo = dateFrom.AddMonths(1).AddDays(-1);
            var userExpenses = await _context.Expenses
                .Include(e => e.Category)
                .Where(e => e.UserId == userId && e.CreateDate >= dateFrom && e.CreateDate <= dateTo)
                .OrderBy(e => e.CategoryId)
                .ThenByDescending(e => e.CreateDate)
                .AsNoTracking()
                .ToListAsync();
            return _mapper.Map<List<ExpenseDto>>(userExpenses);
        }

        public async Task<List<ExpenseDto>> GetExpensesByUserIdAndCategoryId(int userId, int categoryId)
        {
            var userExpensesByCategory = await _context.Expenses
                .Include(e => e.Category)
                .Where(e => e.UserId == userId && e.CategoryId == categoryId)
                .AsNoTracking()
                .ToListAsync();
            return _mapper.Map<List<ExpenseDto>>(userExpensesByCategory);
        }

        public async Task<ExpenseDto> InsertExpenseAsync(ExpenseDto expenseDto)
        {
            var newExpense = _mapper.Map<Expense>(expenseDto);
            await _context.Expenses.AddAsync(newExpense);
            await _context.SaveChangesAsync();
            return _mapper.Map<ExpenseDto>(newExpense);
        }

        public async Task<ExpenseDto?> UpdateExpenseAsync(int expenseId, ExpenseDto expenseDto)
        {
            var expenseToUpdate = await _context.Expenses.FirstOrDefaultAsync(e => e.Id == expenseId);
            if (expenseToUpdate == null) return null;
            _mapper.Map(expenseDto, expenseToUpdate);
            await _context.SaveChangesAsync();
            return _mapper.Map<ExpenseDto>(expenseToUpdate);
        }

        public async Task<bool> DeleteExpenseByIdAsync(int expenseId)
        {
            var expenseToDelete = await _context.Expenses.FirstOrDefaultAsync(e => e.Id == expenseId);
            if (expenseToDelete == null) return false;
            _context.Expenses.Remove(expenseToDelete);
            await _context.SaveChangesAsync();
            return true;
        }

        public async Task<List<ExpenseDto>> GetExpensesForYearlyReportAsync(Report report)
        {
            var startDate = new DateTime(report.Year, 1, 1);
            var endDate = new DateTime(report.Year, 12, 31);
            var userExpenses = await _context.Expenses
                .Include(e => e.Category)
                .Where(e => e.UserId == report.UserId && e.CreateDate >= startDate && e.CreateDate <= endDate)
                .OrderBy(e => e.CreateDate)
                .ThenBy(e => e.CategoryId)
                .AsNoTracking()
                .ToListAsync();
            return _mapper.Map<List<ExpenseDto>>(userExpenses);
        }

        public async Task<List<ExpenseDto>> GetExpensesForMonthlyReportAsync(Report report)
        {
            var startDate = new DateTime(report.Year, report.Month, 1);
            var endDate = startDate.AddMonths(1).AddDays(-1);
            var userExpenses = await _context.Expenses
                .Include(e => e.Category)
                .Where(e => e.UserId == report.UserId && e.CreateDate >= startDate && e.CreateDate <= endDate)
                .OrderBy(e => e.CreateDate)
                .ThenBy(e => e.CategoryId)
                .AsNoTracking()
                .ToListAsync();
            return _mapper.Map<List<ExpenseDto>>(userExpenses);
        }
    }
}