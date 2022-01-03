using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;
using AutoMapper;
using Core.DTOs;
using Core.Interfaces;
using Core.Models;
using Microsoft.EntityFrameworkCore;
using Microsoft.Win32;

namespace DataBase.Services
{
    public class RevenueCategoryService: IRevenueCategoryService
    {
        private readonly ExpensesTrackerContext _context;
        private readonly IMapper _mapper;

        public RevenueCategoryService(ExpensesTrackerContext context, IMapper mapper)
        {
            _context = context;
            _mapper = mapper;
        }
        public async Task<List<RevenueCategoryDto>> GetRevenueCategoriesAsync()
        {
            var revenueCategories = await _context.RevenuesCategories
                .AsNoTracking()
                .ToListAsync();
            return _mapper.Map<List<RevenueCategoryDto>>(revenueCategories);
        }

        public async Task<List<RevenueCategoryDto>> GetRevenueCategoriesByUserIdAsync(int userId)
        {
            var userRevenueCategories = await _context.RevenuesCategories
                .Where(rc => rc.UserId == userId)
                .AsNoTracking()
                .ToListAsync();
            return _mapper.Map<List<RevenueCategoryDto>>(userRevenueCategories);
        }

        public async Task<RevenueCategoryDto?> GetRevenueCategoryByIdAsync(int revenueCategoryId)
        {
            var revenueCategory = await _context.RevenuesCategories
                .AsNoTracking()
                .FirstOrDefaultAsync(rc => rc.Id == revenueCategoryId);
            return revenueCategory == null ? null : _mapper.Map<RevenueCategoryDto>(revenueCategory);
        }

        public async Task<RevenueCategoryDto> InsertRevenueCategoryAsync(RevenueCategoryDto revenueCategoryDto)
        {
            var revenueCategory = _mapper.Map<RevenueCategory>(revenueCategoryDto);
            await _context.RevenuesCategories.AddAsync(revenueCategory);
            await _context.SaveChangesAsync();
            return _mapper.Map<RevenueCategoryDto>(revenueCategory);
        }

        public async Task<RevenueCategoryDto?> UpdateRevenueCategoryAsync(int revenueCategoryId, RevenueCategoryDto revenueCategoryDto)
        {
            var revenueCategoryToUpdate =
                await _context.RevenuesCategories.FirstOrDefaultAsync(rc => rc.Id == revenueCategoryId);
            if (revenueCategoryToUpdate == null) return null;
            _mapper.Map(revenueCategoryDto, revenueCategoryToUpdate);
            await _context.SaveChangesAsync();
            return _mapper.Map<RevenueCategoryDto>(revenueCategoryToUpdate);
        }

        public async Task<bool> DeleteRevenueCategoryById(int revenueCategoryId)
        {
            var revenueCategoryToDelete =
                await _context.RevenuesCategories.FirstOrDefaultAsync(rc => rc.Id == revenueCategoryId);
            if (revenueCategoryToDelete == null) return false;
            var revenues = await _context.Revenues.Where(r => r.RevenueCategoryId == revenueCategoryId).ToListAsync();
            if (revenues.Any()) _context.Revenues.RemoveRange(revenues);
            _context.RevenuesCategories.Remove(revenueCategoryToDelete);
            await _context.SaveChangesAsync();
            return true;
        }
    }
}
