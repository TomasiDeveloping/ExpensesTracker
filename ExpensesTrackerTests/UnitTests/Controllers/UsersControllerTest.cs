using Core.DTOs;
using Core.Helper.Classes;
using Core.Interfaces;
using ExpensesTracker.Controllers.v1;
using Microsoft.AspNetCore.Mvc;
using Microsoft.Extensions.Options;
using Moq;
using System;
using Xunit;

namespace ExpensesTrackerTests.UnitTests.Controllers
{
    [Trait("UsersController", "Unit")]
    public class UsersControllerTest
    {
        private readonly Mock<IUserService> _mockRepo;
        private readonly UsersController _usersController;

        public UsersControllerTest()
        {
            var settings = Options.Create(new EmailSettings());
            _mockRepo = new Mock<IUserService>();
            _usersController = new UsersController(_mockRepo.Object, settings, null);
        }

        [Fact]
        public async void UserController_GetUserById_Whit_ValidUser()
        {
            const int userId = 1;
            var user = GetTestUser();
            _mockRepo.Setup(x => x.GetUserByIdAsync(userId))
                .ReturnsAsync(user);

            var result = await _usersController.Get(user.Id) as ObjectResult;

            var testUser = Assert.IsType<UserDto>(result?.Value);
            Assert.NotNull(testUser);
            Assert.Equal(user.FirstName, testUser.FirstName);
            Assert.Equal(user.LastName, testUser.LastName);
            Assert.Equal(user.IsActive, testUser.IsActive);
        }

        [Fact]
        public async void UserController_PostAsync_InsertUser()
        {
            var user = GetTestUser();
            UserDto testUser = null;
            _mockRepo.Setup(x => x.InsertUserAsync(It.IsAny<UserDto>()))
                .Callback<UserDto>(x => testUser = x);

            await _usersController.CreateUser(user);
            _mockRepo.Verify(x => x.InsertUserAsync(It.IsAny<UserDto>()), Times.Once);

            Assert.NotNull(testUser);
            Assert.Equal(user.FirstName, testUser?.FirstName);
            Assert.Equal(user.LastName, testUser?.LastName);
            _mockRepo.Verify();
        }

        [Fact]
        public async void UserController_PutAsync_UpdateUser()
        {
            var testUser = GetTestUser();
            _mockRepo.Setup(x => x.UpdateUserAsync(1, It.IsAny<UserDto>()))
                .ReturnsAsync(testUser);
            testUser.LastName = "Update";

            var result = await _usersController.UpdateUser(testUser.Id, testUser) as ObjectResult;

            var updatedUser = result?.Value as UserDto;
            Assert.Equal(200, result?.StatusCode);
            Assert.IsType<UserDto>(updatedUser);
            Assert.Equal(testUser.LastName, updatedUser?.LastName);
        }

        [Fact]
        public async void UserController_DeleteAsync_DeleteUserSuccessfully()
        {
            var testUser = GetTestUser();
            _mockRepo.Setup(x => x.DeleteUserAsync(1))
                .ReturnsAsync(true);

            var result = await _usersController.DeleteUser(testUser.Id) as ObjectResult;
            Assert.NotNull(result);
            Assert.Equal(200, result?.StatusCode);
            Assert.True((bool)(result?.Value ?? false));
        }

        private static UserDto GetTestUser()
        {
            return new UserDto()
            {
                CreatedAt = DateTime.Now,
                Email = "test@test.com",
                FirstName = "John",
                LastName = "Doe",
                IsActive = true,
                MonthlyBudget = 1000,
                Password = "Test",
                WithRevenue = true,
                Id = 1
            };
        }
    }
}