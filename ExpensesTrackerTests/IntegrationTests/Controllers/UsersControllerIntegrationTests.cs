using Core.DTOs;
using ExpensesTrackerTests.Attributes;
using System;
using System.Collections.Generic;
using System.Net.Http;
using System.Net.Http.Headers;
using System.Net.Http.Json;
using System.Threading.Tasks;
using Xunit;

namespace ExpensesTrackerTests.IntegrationTests.Controllers
{
    [TestCaseOrderer("ExpensesTrackerTests.Helper.PriorityOrderer", "ExpensesTrackerTests")]
    [Trait("UserController", "Integration")]
    public class UsersControllerIntegrationTests : IClassFixture<TestingWebAppFactory>
    {
        private readonly HttpClient _client;

        public UsersControllerIntegrationTests(TestingWebAppFactory factory)
        {
            _client = factory.CreateClient();
            _client.DefaultRequestHeaders.Authorization = new AuthenticationHeaderValue("Test");
        }

        [Fact, TestPriority(1)]
        public async Task CreateUser()
        {
            var data = new UserDto()
            {
                FirstName = "Johnny",
                LastName = "Doe",
                Email = "johnny@test.com",
                CreatedAt = DateTime.Now,
                IsActive = true,
                MonthlyBudget = 1000,
                Password = "Test",
                WithRevenue = true
            };
            var postRequest = new HttpRequestMessage(HttpMethod.Post, "/api/v1.0/Users")
            {
                Content = JsonContent.Create(data)
            };

            var response = await _client.SendAsync(postRequest);

            response.EnsureSuccessStatusCode();

            var user = await response.Content.ReadFromJsonAsync<UserDto>();

            Assert.NotNull(user);
            Assert.Equal("Johnny", user?.FirstName);
            Assert.Equal("Doe", user?.LastName);
            Assert.True(user?.IsActive);
        }

        [Fact, TestPriority(2)]
        public async Task GetUsers()
        {
            var getRequest = new HttpRequestMessage(HttpMethod.Get, "api/v1.0/Users");

            var response = await _client.SendAsync(getRequest);
            response.EnsureSuccessStatusCode();
            var users = await response.Content.ReadFromJsonAsync<List<UserDto>>();

            Assert.NotNull(users);
            Assert.Equal("John", users?.Find(x => x.Id == 1)?.FirstName);
        }

        [Fact, TestPriority(3)]
        public async Task UpdateUsers()
        {
            var data = new UserDto()
            {
                Password = "PasswordUpdate",
                FirstName = "UpdateFirstname",
                LastName = "UpdateLastname",
                CreatedAt = new DateTime(2022, 1, 1),
                Email = "update@update.com",
                IsActive = false,
                MonthlyBudget = 0,
                WithRevenue = false,
                Id = 1
            };

            var putRequest = new HttpRequestMessage(HttpMethod.Put, $"api/v1.0/Users/{data.Id}")
            {
                Content = JsonContent.Create(data),
            };

            var response = await _client.SendAsync(putRequest);
            response.EnsureSuccessStatusCode();
            var user = await response.Content.ReadFromJsonAsync<UserDto>();

            Assert.NotNull(user);
            Assert.Equal("UpdateFirstname", user?.FirstName);
            Assert.Equal("UpdateLastname", user?.LastName);
            Assert.Equal("update@update.com", user?.Email);
            Assert.False(user?.IsActive);
            Assert.False(user?.WithRevenue);
            Assert.Equal(0, user?.MonthlyBudget);
            Assert.Equal(new DateTime(2022, 1, 1), user?.CreatedAt);
            Assert.NotEqual("PasswordUpdate", user?.Password);
        }

        [Fact, TestPriority(4)]
        public async Task DeleteUserAsync()
        {
            var deleteRequest = new HttpRequestMessage(HttpMethod.Delete, "api/v1.0/Users/1");

            var response = await _client.SendAsync(deleteRequest);
            response.EnsureSuccessStatusCode();

            var checkDelete = await response.Content.ReadFromJsonAsync<bool>();

            Assert.True(checkDelete);
        }
    }
}