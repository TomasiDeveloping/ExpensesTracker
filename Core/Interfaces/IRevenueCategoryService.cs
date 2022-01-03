using Core.DTOs;

namespace Core.Interfaces
{
    public interface IRevenueCategoryService
    {
        public Task<List<RevenueCategoryDto>> GetRevenueCategoriesAsync();

        public Task<List<RevenueCategoryDto>> GetRevenueCategoriesByUserIdAsync(int userId);

        public Task<RevenueCategoryDto?> GetRevenueCategoryByIdAsync(int revenueCategoryId);

        public Task<RevenueCategoryDto> InsertRevenueCategoryAsync(RevenueCategoryDto revenueCategoryDto);

        public Task<RevenueCategoryDto?> UpdateRevenueCategoryAsync(int revenueCategoryId, RevenueCategoryDto revenueCategoryDto);

        public Task<bool> DeleteRevenueCategoryById(int revenueCategoryId);
    }
}
