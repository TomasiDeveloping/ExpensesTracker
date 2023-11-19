using AutoMapper;
using Core.DTOs;
using Core.Helper.Services;
using Core.Interfaces;
using Core.Models;
using Microsoft.EntityFrameworkCore;

namespace DataBase.Services;

public class UserService(IMapper mapper, ExpensesTrackerContext context) : IUserService
{
    public async Task<List<UserDto>> GetUsersAsync()
    {
        var users = await context.Users
            .AsNoTracking()
            .ToListAsync();
        return mapper.Map<List<UserDto>>(users);
    }

    public async Task<UserDto> GetUserByIdAsync(int userId)
    {
        var user = await context.Users
            .AsNoTracking()
            .FirstOrDefaultAsync(u => u.Id == userId);
        return user == null ? null : mapper.Map<UserDto>(user);
    }

    public async Task<User> GetUserByEmailForLoginAsync(string email)
    {
        var user = await context.Users
            .AsNoTracking()
            .FirstOrDefaultAsync(u => u.Email == email);
        return user;
    }

    public async Task<UserDto> GetUserByEmailAsync(string email)
    {
        var user = await context.Users.FirstOrDefaultAsync(u => u.Email == email);
        return user == null ? null : mapper.Map<UserDto>(user);
    }

    public async Task<UserDto> InsertUserAsync(UserDto userDto)
    {
        var passwordHashAndSalt = PasswordService.CreateNewPassword(userDto.Password);

        var newUser = new User
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
        await context.Users.AddAsync(newUser);
        await context.SaveChangesAsync();
        return mapper.Map<UserDto>(newUser);
    }

    public async Task<UserDto> UpdateUserAsync(int userId, UserDto userDto)
    {
        var userToUpdate = await context.Users.FirstOrDefaultAsync(u => u.Id == userId);
        if (userToUpdate == null) return null;
        mapper.Map(userDto, userToUpdate);
        await context.SaveChangesAsync();
        return mapper.Map<UserDto>(userToUpdate);
    }

    public async Task<bool> DeleteUserAsync(int userId)
    {
        var userToDelete = await context.Users.FirstOrDefaultAsync(u => u.Id == userId);
        if (userToDelete == null) return false;
        var userExpenses = await context.Expenses.Where(e => e.UserId == userId).ToListAsync();
        if (userExpenses.Any()) context.Expenses.RemoveRange(userExpenses);
        var userCategories = await context.Categories.Where(c => c.UserId == userId).ToListAsync();
        if (userCategories.Any()) context.Categories.RemoveRange(userCategories);
        var userRevenues = await context.Revenues.Where(r => r.UserId == userId).ToListAsync();
        if (userRevenues.Any()) context.Revenues.RemoveRange(userRevenues);
        var userRevenuesCategories =
            await context.RevenuesCategories.Where(rc => rc.UserId == userId).ToListAsync();
        if (userRevenuesCategories.Any()) context.RevenuesCategories.RemoveRange(userRevenuesCategories);
        context.Users.Remove(userToDelete);
        await context.SaveChangesAsync();
        return true;
    }

    public async Task<bool> ChangeUserPasswordAsync(int userId, string password)
    {
        var user = await context.Users.FirstOrDefaultAsync(u => u.Id == userId);
        if (user == null) return false;

        var passwordHashAndSalt = PasswordService.CreateNewPassword(password);

        user.Salt = passwordHashAndSalt.PasswordSalt;
        user.Password = passwordHashAndSalt.PasswordHash;
        await context.SaveChangesAsync();
        return true;
    }
}