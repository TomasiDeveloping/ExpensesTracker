using AutoMapper;
using Core.DTOs;
using Core.Interfaces;
using Core.Models;
using Microsoft.EntityFrameworkCore;

namespace DataBase.Services
{
    public class CategoryService : ICategoryService
    {
        private readonly IMapper _mapper;
        private readonly ExpensesTrackerContext _context;

        public CategoryService(IMapper mapper, ExpensesTrackerContext context)
        {
            _mapper = mapper;
            _context = context;
        }

        public async Task<List<CategoryDto>> GetCategoriesAsync()
        {
            var categories = await _context.Categories
                .AsNoTracking()
                .ToListAsync();
            return _mapper.Map<List<CategoryDto>>(categories);
        }

        public async Task<List<CategoryDto>> GetCategoriesByUserIdAsync(int userId)
        {
            var userCategories = await _context.Categories
                .Where(c => c.UserId == userId)
                .AsNoTracking()
                .ToListAsync();
            return _mapper.Map<List<CategoryDto>>(userCategories);
        }

        public async Task<CategoryDto?> GetCategoryByIdAsync(int categoryId)
        {
            var category = await _context.Categories
                .AsNoTracking()
                .FirstOrDefaultAsync(c => c.Id == categoryId);
            return category == null ? null : _mapper.Map<CategoryDto>(category);
        }

        public async Task<CategoryDto> InsertCategoryAsync(CategoryDto categoryDto)
        {
            var newCategory = _mapper.Map<Category>(categoryDto);
            await _context.Categories.AddAsync(newCategory);
            await _context.SaveChangesAsync();
            return _mapper.Map<CategoryDto>(newCategory);
        }

        public async Task<CategoryDto?> UpdateCategoryAsync(int categoryId, CategoryDto categoryDto)
        {
            var categoryToUpdate = await _context.Categories.FirstOrDefaultAsync(c => c.Id == categoryId);
            if (categoryToUpdate == null) return null;
            _mapper.Map(categoryDto, categoryToUpdate);
            await _context.SaveChangesAsync();
            return _mapper.Map<CategoryDto>(categoryToUpdate);
        }

        public async Task<bool> DeleteCategoryById(int categoryId)
        {
            var categoryToDelete = await _context.Categories.FirstOrDefaultAsync(c => c.Id == categoryId);
            if (categoryToDelete == null) return false;
            var expenses = await _context.Expenses.Where(e => e.CategoryId == categoryToDelete.Id).ToListAsync();
            if (expenses.Any())
            {
                _context.Expenses.RemoveRange(expenses);
            }
            _context.Categories.Remove(categoryToDelete);
            await _context.SaveChangesAsync();
            return true;
        }
    }
}