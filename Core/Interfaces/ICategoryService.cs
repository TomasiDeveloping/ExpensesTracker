using Core.DTOs;

namespace Core.Interfaces
{
    public interface ICategoryService
    {
        public Task<List<CategoryDto>> GetCategoriesAsync();

        public Task<List<CategoryDto>> GetCategoriesByUserIdAsync(int userId);

        public Task<CategoryDto?> GetCategoryByIdAsync(int categoryId);

        public Task<CategoryDto> InsertCategoryAsync(CategoryDto categoryDto);

        public Task<CategoryDto?> UpdateCategoryAsync(int categoryId, CategoryDto categoryDto);

        public Task<bool> DeleteCategoryById(int categoryId);
    }
}