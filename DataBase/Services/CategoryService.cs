using AutoMapper;
using Core.DTOs;
using Core.Interfaces;
using Core.Models;
using Microsoft.EntityFrameworkCore;

namespace DataBase.Services;

public class CategoryService(IMapper mapper, ExpensesTrackerContext context) : ICategoryService
{
    public async Task<List<CategoryDto>> GetCategoriesAsync()
    {
        var categories = await context.Categories
            .AsNoTracking()
            .ToListAsync();
        return mapper.Map<List<CategoryDto>>(categories);
    }

    public async Task<List<CategoryDto>> GetCategoriesByUserIdAsync(int userId)
    {
        var userCategories = await context.Categories
            .Where(c => c.UserId == userId)
            .AsNoTracking()
            .ToListAsync();
        return mapper.Map<List<CategoryDto>>(userCategories);
    }

    public async Task<CategoryDto> GetCategoryByIdAsync(int categoryId)
    {
        var category = await context.Categories
            .AsNoTracking()
            .FirstOrDefaultAsync(c => c.Id == categoryId);
        return category == null ? null : mapper.Map<CategoryDto>(category);
    }

    public async Task<CategoryDto> InsertCategoryAsync(CategoryDto categoryDto)
    {
        var newCategory = mapper.Map<Category>(categoryDto);
        await context.Categories.AddAsync(newCategory);
        await context.SaveChangesAsync();
        return mapper.Map<CategoryDto>(newCategory);
    }

    public async Task<CategoryDto> UpdateCategoryAsync(int categoryId, CategoryDto categoryDto)
    {
        var categoryToUpdate = await context.Categories.FirstOrDefaultAsync(c => c.Id == categoryId);
        if (categoryToUpdate == null) return null;
        mapper.Map(categoryDto, categoryToUpdate);
        await context.SaveChangesAsync();
        return mapper.Map<CategoryDto>(categoryToUpdate);
    }

    public async Task<bool> DeleteCategoryById(int categoryId)
    {
        var categoryToDelete = await context.Categories.FirstOrDefaultAsync(c => c.Id == categoryId);
        if (categoryToDelete == null) return false;
        var expenses = await context.Expenses.Where(e => e.CategoryId == categoryToDelete.Id).ToListAsync();
        if (expenses.Any()) context.Expenses.RemoveRange(expenses);
        var recurringTasks = await context.RecurringTasks.Where(rt => rt.CategoryId.Equals(categoryId)).ToListAsync();
        if (recurringTasks.Any()) context.RecurringTasks.RemoveRange(recurringTasks);
        context.Categories.Remove(categoryToDelete);
        await context.SaveChangesAsync();
        return true;
    }
}