using AutoMapper;
using Core.DTOs;
using Core.Interfaces;
using Core.Models;
using Microsoft.EntityFrameworkCore;

namespace DataBase.Services
{
    public class RevenueService : IRevenueService
    {
        private readonly ExpensesTrackerContext _context;
        private readonly IMapper _mapper;

        public RevenueService(ExpensesTrackerContext context, IMapper mapper)
        {
            _context = context;
            _mapper = mapper;
        }
        public async Task<List<RevenueDto>> GetRevenuesAsync()
        {
            var revenues = await _context.Revenues
                .Include(r => r.RevenueCategory)
                .AsNoTracking()
                .ToListAsync();
            return _mapper.Map<List<RevenueDto>>(revenues);
        }

        public async Task<RevenueDto?> GetRevenueByIdAsync(int revenueId)
        {
            var revenue = await _context.Revenues
                .Include(r => r.RevenueCategory)
                .AsNoTracking()
                .FirstOrDefaultAsync(r => r.Id == revenueId);
            return revenue == null ? null : _mapper.Map<RevenueDto>(revenue);
        }

        public async Task<List<RevenueDto>> GetRevenuesByUserIdAsync(int userId)
        {
            var userRevenues = await _context.Revenues
                .Include(r => r.RevenueCategory)
                .Where(r => r.UserId == userId)
                .AsNoTracking()
                .ToListAsync();
            return _mapper.Map<List<RevenueDto>>(userRevenues);
        }

        public async Task<List<RevenueDto>> GetUserYearlyExpensesAsync(int userId, int year)
        {
            var startDate = new DateTime(year, 1, 1);
            var endDate = new DateTime(year, 12, 31);
            var userRevenues = await _context.Revenues
                .Include(r => r.RevenueCategory)
                .Where(e => e.UserId == userId && e.CreateDate >= startDate && e.CreateDate <= endDate)
                .OrderBy(e => e.RevenueCategoryId)
                .AsNoTracking()
                .ToListAsync();
            return _mapper.Map<List<RevenueDto>>(userRevenues);
        }

        public async Task<List<RevenueDto>> GetUserRevenuesByParamsAsync(int userId, int year, int month)
        {
            var dateFrom = new DateTime(year, month, 1);
            var dateTo = dateFrom.AddMonths(1).AddDays(-1);
            var userRevenues = await _context.Revenues
                .Include(e => e.RevenueCategory)
                .Where(e => e.UserId == userId && e.CreateDate >= dateFrom && e.CreateDate <= dateTo)
                .OrderBy(e => e.RevenueCategoryId)
                .ThenByDescending(e => e.CreateDate)
                .AsNoTracking()
                .ToListAsync();
            return _mapper.Map<List<RevenueDto>>(userRevenues);
        }

        public async Task<RevenueDto> InsertRevenueAsync(RevenueDto revenueDto)
        {
            var revenue = _mapper.Map<Revenue>(revenueDto);
            await _context.Revenues.AddAsync(revenue);
            await _context.SaveChangesAsync();
            return _mapper.Map<RevenueDto>(revenue);
        }

        public async Task<RevenueDto?> UpdateRevenueAsync(int revenueId, RevenueDto revenueDto)
        {
            var revenueToUpdate = await _context.Revenues.FirstOrDefaultAsync(r => r.Id == revenueId);
            if (revenueToUpdate == null) return null;
            _mapper.Map(revenueDto, revenueToUpdate);
            await _context.SaveChangesAsync();
            return _mapper.Map<RevenueDto>(revenueToUpdate);
        }

        public async Task<bool> DeleteRevenueByIdAsync(int revenueId)
        {
            var revenueToDelete = await _context.Revenues.FirstOrDefaultAsync(r => r.Id == revenueId);
            if (revenueToDelete == null) return false;
            _context.Revenues.Remove(revenueToDelete);
            await _context.SaveChangesAsync();
            return true;
        }
    }
}
