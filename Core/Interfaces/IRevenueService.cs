using Core.DTOs;

namespace Core.Interfaces
{
    public interface IRevenueService
    {
        Task<List<RevenueDto>> GetRevenuesAsync();
        Task<RevenueDto?> GetRevenueByIdAsync(int revenueId);
        Task<List<RevenueDto>> GetRevenuesByUserIdAsync(int userId);
        Task<RevenueDto> InsertRevenueAsync(RevenueDto revenueDto);
        Task<RevenueDto?> UpdateRevenueAsync(int revenueId, RevenueDto revenueDto);
        Task<bool> DeleteRevenueByIdAsync(int revenueId);
    }
}
