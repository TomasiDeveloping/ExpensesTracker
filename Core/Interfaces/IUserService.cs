using Core.DTOs;

namespace Core.Interfaces
{
    public interface IUserService
    {
        public Task<List<UserDto>> GetUsersAsync();

        public Task<UserDto?> GetUserByIdAsync(int userId);

        public Task<UserDto> InsertUserAsync(UserDto userDto);

        public Task<UserDto?> UpdateUserAsync(int userId, UserDto userDto);

        public Task<bool> DeleteUserAsync(int userId);
    }
}