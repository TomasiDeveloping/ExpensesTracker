using AutoMapper;
using Core.DTOs;
using Core.Helper.Services;
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
            var users = await _context.Users
                .AsNoTracking()
                .ToListAsync();
            return _mapper.Map<List<UserDto>>(users);
        }

        public async Task<UserDto?> GetUserByIdAsync(int userId)
        {
            var user = await _context.Users
                .AsNoTracking()
                .FirstOrDefaultAsync(u => u.Id == userId);
            return user == null ? null : _mapper.Map<UserDto>(user);
        }

        public async Task<User?> GetUserByEmailForLoginAsync(string email)
        {
            var user = await _context.Users
                .AsNoTracking()
                .FirstOrDefaultAsync(u => u.Email == email);
            return user;
        }

        public async Task<UserDto?> GetUserByEmailAsync(string email)
        {
            var user = await _context.Users.FirstOrDefaultAsync(u => u.Email == email);
            return user == null ? null : _mapper.Map<UserDto>(user);
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
            var userExpenses = await _context.Expenses.Where(e => e.UserId == userId).ToListAsync();
            if (userExpenses.Any()) _context.Expenses.RemoveRange(userExpenses);
            var userCategories = await _context.Categories.Where(c => c.UserId == userId).ToListAsync();
            if (userCategories.Any()) _context.Categories.RemoveRange(userCategories);
            var userRevenues = await _context.Revenues.Where(r => r.UserId == userId).ToListAsync();
            if (userRevenues.Any()) _context.Revenues.RemoveRange(userRevenues);
            var userRevenuesCategories =
                await _context.RevenuesCategories.Where(rc => rc.UserId == userId).ToListAsync();
            if (userRevenuesCategories.Any()) _context.RevenuesCategories.RemoveRange(userRevenuesCategories);
            _context.Users.Remove(userToDelete);
            await _context.SaveChangesAsync();
            return true;
        }

        public async Task<bool> ChangeUserPasswordAsync(int userId, string password)
        {
            var user = await _context.Users.FirstOrDefaultAsync(u => u.Id == userId);
            if (user == null) return false;

            var passwordHashAndSalt = PasswordService.CreateNewPassword(password);

            user.Salt = passwordHashAndSalt.PasswordSalt;
            user.Password = passwordHashAndSalt.PasswordHash;
            await _context.SaveChangesAsync();
            return true;
        }
    }
}