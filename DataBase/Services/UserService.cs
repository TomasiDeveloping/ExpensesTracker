using AutoMapper;
using Core.DTOs;
using Core.Helper;
using Core.Interfaces;
using Core.Models;
using Microsoft.EntityFrameworkCore;

namespace DataBase.Services
{
    public class UserService : IUserService
    {
        private readonly IMapper _mapper;
        private readonly ExpensesTrackerContext _context;

        public UserService(IMapper mapper, ExpensesTrackerContext context)
        {
            _mapper = mapper;
            _context = context;
        }

        public async Task<List<UserDto>> GetUsersAsync()
        {
            var users = await _context.Users.ToListAsync();
            return _mapper.Map<List<UserDto>>(users);
        }

        public async Task<UserDto?> GetUserByIdAsync(int userId)
        {
            var user = await _context.Users.FirstOrDefaultAsync(u => u.Id == userId);
            return user == null ? null : _mapper.Map<UserDto>(user);
        }

        public async Task<User?> GetUserByEmailForLoginAsync(string email)
        {
            return await _context.Users.FirstOrDefaultAsync(u => u.Email == email);
        }

        public async Task<UserDto> InsertUserAsync(UserDto userDto)
        {
            var passwordHashAndSalt = PasswordService.CreateNewPassword(userDto.Password);

            var newUser = new User()
            {
                FirstName = userDto.FirstName,
                LastName = userDto.LastName,
                Email = userDto.Email,
                IsActive = true,
                MonthlyBudget = 0,
                CreatedAt = DateTime.Now,
                Password = passwordHashAndSalt.PasswordHash,
                Salt = passwordHashAndSalt.PasswordSalt
            };
            await _context.Users.AddAsync(newUser);
            await _context.SaveChangesAsync();
            return _mapper.Map<UserDto>(newUser);
        }

        public async Task<UserDto?> UpdateUserAsync(int userId, UserDto userDto)
        {
            var userToUpdate = await _context.Users.FirstOrDefaultAsync(u => u.Id == userId);
            if (userToUpdate == null) return null;
            _mapper.Map(userDto, userToUpdate);
            await _context.SaveChangesAsync();
            return _mapper.Map<UserDto>(userToUpdate);
        }

        public async Task<bool> DeleteUserAsync(int userId)
        {
            var userToDelete = await _context.Users.FirstOrDefaultAsync(u => u.Id == userId);
            if (userToDelete == null) return false;
            _context.Users.Remove(userToDelete);
            await _context.SaveChangesAsync();
            return true;
        }
    }
}