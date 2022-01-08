using Core.DTOs;

namespace Core.Interfaces
{
    public interface IRevenueService
    {
        Task<List<RevenueDto>> GetRevenuesAsync();
        Task<RevenueDto?> GetRevenueByIdAsync(int revenueId);
        Task<List<RevenueDto>> GetRevenuesByUserIdAsync(int userId);
        Task<List<RevenueDto>> GetUserRevenuesByParamsAsync(int userId, int year, int month);
        Task<List<RevenueDto>> GetUserYearlyExpensesAsync(int userId, int year);
        Task<RevenueDto> InsertRevenueAsync(RevenueDto revenueDto);
        Task<RevenueDto?> UpdateRevenueAsync(int revenueId, RevenueDto revenueDto);
        Task<bool> DeleteRevenueByIdAsync(int revenueId);
    }
}
