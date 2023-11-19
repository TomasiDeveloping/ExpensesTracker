using AutoMapper;
using Core.DTOs;
using Core.Helper.Classes;
using Core.Interfaces;
using Core.Models;
using Microsoft.EntityFrameworkCore;

namespace DataBase.Services;

public class RevenueService(ExpensesTrackerContext context, IMapper mapper) : IRevenueService
{
    public async Task<List<RevenueDto>> GetRevenuesAsync()
    {
        var revenues = await context.Revenues
            .Include(r => r.RevenueCategory)
            .AsNoTracking()
            .ToListAsync();
        return mapper.Map<List<RevenueDto>>(revenues);
    }

    public async Task<RevenueDto> GetRevenueByIdAsync(int revenueId)
    {
        var revenue = await context.Revenues
            .Include(r => r.RevenueCategory)
            .AsNoTracking()
            .FirstOrDefaultAsync(r => r.Id == revenueId);
        return revenue == null ? null : mapper.Map<RevenueDto>(revenue);
    }

    public async Task<List<RevenueDto>> GetRevenuesByUserIdAsync(int userId)
    {
        var userRevenues = await context.Revenues
            .Include(r => r.RevenueCategory)
            .Where(r => r.UserId == userId)
            .AsNoTracking()
            .ToListAsync();
        return mapper.Map<List<RevenueDto>>(userRevenues);
    }

    public async Task<List<RevenueDto>> GetUserYearlyExpensesAsync(int userId, int year)
    {
        var startDate = new DateTime(year, 1, 1);
        var endDate = new DateTime(year, 12, 31);
        var userRevenues = await context.Revenues
            .Include(r => r.RevenueCategory)
            .Where(e => e.UserId == userId && e.CreateDate >= startDate && e.CreateDate <= endDate)
            .OrderBy(e => e.RevenueCategoryId)
            .AsNoTracking()
            .ToListAsync();
        return mapper.Map<List<RevenueDto>>(userRevenues);
    }

    public async Task<List<RevenueDto>> GetUserRevenuesByParamsAsync(int userId, int year, int month)
    {
        var dateFrom = new DateTime(year, month, 1);
        var dateTo = dateFrom.AddMonths(1).AddDays(-1);
        var userRevenues = await context.Revenues
            .Include(e => e.RevenueCategory)
            .Where(e => e.UserId == userId && e.CreateDate >= dateFrom && e.CreateDate <= dateTo)
            .OrderBy(e => e.RevenueCategoryId)
            .ThenByDescending(e => e.CreateDate)
            .AsNoTracking()
            .ToListAsync();
        return mapper.Map<List<RevenueDto>>(userRevenues);
    }

    public async Task<RevenueDto> InsertRevenueAsync(RevenueDto revenueDto)
    {
        var revenue = mapper.Map<Revenue>(revenueDto);
        await context.Revenues.AddAsync(revenue);
        await context.SaveChangesAsync();
        return mapper.Map<RevenueDto>(revenue);
    }

    public async Task<RevenueDto> UpdateRevenueAsync(int revenueId, RevenueDto revenueDto)
    {
        var revenueToUpdate = await context.Revenues.FirstOrDefaultAsync(r => r.Id == revenueId);
        if (revenueToUpdate == null) return null;
        mapper.Map(revenueDto, revenueToUpdate);
        await context.SaveChangesAsync();
        return mapper.Map<RevenueDto>(revenueToUpdate);
    }

    public async Task<bool> DeleteRevenueByIdAsync(int revenueId)
    {
        var revenueToDelete = await context.Revenues.FirstOrDefaultAsync(r => r.Id == revenueId);
        if (revenueToDelete == null) return false;
        context.Revenues.Remove(revenueToDelete);
        await context.SaveChangesAsync();
        return true;
    }

    public async Task<List<RevenueDto>> GetRevenuesForYearlyReportAsync(Report report)
    {
        var startDate = new DateTime(report.Year, 1, 1);
        var endDate = new DateTime(report.Year, 12, 31);
        var userRevenues = await context.Revenues
            .Include(r => r.RevenueCategory)
            .Where(r => r.UserId == report.UserId && r.CreateDate >= startDate && r.CreateDate <= endDate)
            .OrderBy(r => r.CreateDate)
            .ThenBy(r => r.RevenueCategoryId)
            .AsNoTracking()
            .ToListAsync();
        return mapper.Map<List<RevenueDto>>(userRevenues);
    }

    public async Task<List<RevenueDto>> GetRevenuesForMonthlyReportAsync(Report report)
    {
        var startDate = new DateTime(report.Year, report.Month, 1);
        var endDate = startDate.AddMonths(1).AddDays(-1);
        var userRevenues = await context.Revenues
            .Include(r => r.RevenueCategory)
            .Where(r => r.UserId == report.UserId && r.CreateDate >= startDate && r.CreateDate <= endDate)
            .OrderBy(r => r.CreateDate)
            .ThenBy(r => r.RevenueCategoryId)
            .AsNoTracking()
            .ToListAsync();
        return mapper.Map<List<RevenueDto>>(userRevenues);
    }
}