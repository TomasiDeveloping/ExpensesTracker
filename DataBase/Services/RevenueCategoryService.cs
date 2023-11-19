using AutoMapper;
using Core.DTOs;
using Core.Interfaces;
using Core.Models;
using Microsoft.EntityFrameworkCore;

namespace DataBase.Services;

public class RevenueCategoryService(ExpensesTrackerContext context, IMapper mapper) : IRevenueCategoryService
{
    public async Task<List<RevenueCategoryDto>> GetRevenueCategoriesAsync()
    {
        var revenueCategories = await context.RevenuesCategories
            .AsNoTracking()
            .ToListAsync();
        return mapper.Map<List<RevenueCategoryDto>>(revenueCategories);
    }

    public async Task<List<RevenueCategoryDto>> GetRevenueCategoriesByUserIdAsync(int userId)
    {
        var userRevenueCategories = await context.RevenuesCategories
            .Where(rc => rc.UserId == userId)
            .AsNoTracking()
            .ToListAsync();
        return mapper.Map<List<RevenueCategoryDto>>(userRevenueCategories);
    }

    public async Task<RevenueCategoryDto> GetRevenueCategoryByIdAsync(int revenueCategoryId)
    {
        var revenueCategory = await context.RevenuesCategories
            .AsNoTracking()
            .FirstOrDefaultAsync(rc => rc.Id == revenueCategoryId);
        return revenueCategory == null ? null : mapper.Map<RevenueCategoryDto>(revenueCategory);
    }

    public async Task<RevenueCategoryDto> InsertRevenueCategoryAsync(RevenueCategoryDto revenueCategoryDto)
    {
        var revenueCategory = mapper.Map<RevenueCategory>(revenueCategoryDto);
        await context.RevenuesCategories.AddAsync(revenueCategory);
        await context.SaveChangesAsync();
        return mapper.Map<RevenueCategoryDto>(revenueCategory);
    }

    public async Task<RevenueCategoryDto> UpdateRevenueCategoryAsync(int revenueCategoryId,
        RevenueCategoryDto revenueCategoryDto)
    {
        var revenueCategoryToUpdate =
            await context.RevenuesCategories.FirstOrDefaultAsync(rc => rc.Id == revenueCategoryId);
        if (revenueCategoryToUpdate == null) return null;
        mapper.Map(revenueCategoryDto, revenueCategoryToUpdate);
        await context.SaveChangesAsync();
        return mapper.Map<RevenueCategoryDto>(revenueCategoryToUpdate);
    }

    public async Task<bool> DeleteRevenueCategoryById(int revenueCategoryId)
    {
        var revenueCategoryToDelete =
            await context.RevenuesCategories.FirstOrDefaultAsync(rc => rc.Id == revenueCategoryId);
        if (revenueCategoryToDelete == null) return false;
        var revenues = await context.Revenues.Where(r => r.RevenueCategoryId == revenueCategoryId).ToListAsync();
        if (revenues.Any()) context.Revenues.RemoveRange(revenues);
        var recurringTasks = await context.RecurringTasks.Where(rt => rt.RevenueCategoryId.Equals(revenueCategoryId))
            .ToListAsync();
        if (recurringTasks.Any()) context.RecurringTasks.RemoveRange(recurringTasks);
        context.RevenuesCategories.Remove(revenueCategoryToDelete);
        await context.SaveChangesAsync();
        return true;
    }
}