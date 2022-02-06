using Core.Models;
using DataBase;
using ExpensesTrackerTests.IntegrationTests.Helper;
using Microsoft.AspNetCore.Authentication;
using Microsoft.AspNetCore.Hosting;
using Microsoft.AspNetCore.Mvc.Testing;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.DependencyInjection;
using Microsoft.Extensions.Logging;
using System;
using System.Linq;

namespace ExpensesTrackerTests.IntegrationTests
{
    public class TestingWebAppFactory : WebApplicationFactory<Program>
    {
        protected override void ConfigureWebHost(IWebHostBuilder builder)
        {
            builder.ConfigureServices(services =>
            {
                var descriptor = services.SingleOrDefault(
                    d => d.ServiceType ==
                         typeof(DbContextOptions<ExpensesTrackerContext>));
                if (descriptor != null)
                    services.Remove(descriptor);
                services.AddDbContext<ExpensesTrackerContext>(options =>
                {
                    options.UseInMemoryDatabase("InMemoryExpensesTest");
                });
                services.AddAuthentication("Test")
                    .AddScheme<AuthenticationSchemeOptions, TestAuthHandler>("Test", _ => { });
                var sp = services.BuildServiceProvider();

                using var scope = sp.CreateScope();
                var logger = scope.ServiceProvider
                    .GetRequiredService<ILogger<WebApplicationFactory<Program>>>();
                using var appContext = scope.ServiceProvider.GetRequiredService<ExpensesTrackerContext>();
                try
                {
                    appContext.Database.EnsureDeleted();
                    appContext.Database.EnsureCreated();
                    SeedData(appContext);
                }
                catch (Exception ex)
                {
                    logger.LogError(ex, "An error occurred seeding the " +
                                        "database with test messages. Error: {Message}", ex.Message);
                }
            });
        }

        private static void SeedData(ExpensesTrackerContext appContext)
        {
            var user = new User()
            {
                FirstName = "John",
                LastName = "Doe",
                Email = "john@doe.test",
                CreatedAt = DateTime.Now,
                IsActive = true,
                MonthlyBudget = 1000,
                Password = new byte[64],
                Salt = new byte[64],
                WithRevenue = true,
                Id = 1
            };
            appContext.Users.Add(user);
            appContext.SaveChanges();
        }
    }
}