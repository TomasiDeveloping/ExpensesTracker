using Api.Controllers.v1;
using Core.DTOs;
using Core.Interfaces;
using Microsoft.AspNetCore.Mvc;
using Moq;
using System;
using System.Collections.Generic;
using System.Linq;
using Xunit;

namespace ExpensesTrackerTests.UnitTests.Controllers
{
    [Trait("ExpensesController", "Unit")]
    public class ExpensesControllerTests
    {
        private readonly Mock<IExpenseService> _expenseServiceMock;
        private readonly ExpensesController _expensesController;

        public ExpensesControllerTests()
        {
            _expenseServiceMock = new Mock<IExpenseService>();
            _expensesController = new ExpensesController(_expenseServiceMock.Object, null);
        }

        [Fact]
        public async void ExpensesController_Get()
        {
            var testExpenses = GetExpenses();
            _expenseServiceMock.Setup(x => x.GetExpensesAsync())
                .ReturnsAsync(testExpenses);

            var response = await _expensesController.Get() as ObjectResult;
            var expenses = response?.Value as List<ExpenseDto>;

            Assert.IsType<List<ExpenseDto>>(expenses);
            Assert.Equal(2, expenses?.Count);
            Assert.Equal("Test 2", expenses?[1].Description);
        }

        [Theory]
        [InlineData(1, 200)]
        [InlineData(2, 400)]
        public async void ExpensesController_GetExpensesByIdAsync(int expenseId, int statusCode)
        {
            var testExpense = GetExpenses().First(x => x.Id == 1);
            _expenseServiceMock.Setup(x => x.GetExpenseByIdAsync(1))
                .ReturnsAsync(testExpense);

            var response = await _expensesController.Get(expenseId) as ObjectResult;

            Assert.Equal(statusCode, response?.StatusCode);
        }

        [Fact]
        public async void ExpensesController_GetUsersExpensesByParamsAsync()
        {
            var testExpenses = GetExpenses();
            _expenseServiceMock.Setup(x => x.GetUserExpensesByParamsAsync(1, 2022, 1))
                .ReturnsAsync(testExpenses);

            var response = await _expensesController.GetExpensesByUserId(1, 2022, 1) as ObjectResult;
            var userExpenses = response?.Value as List<ExpenseDto>;

            Assert.Equal(200, response?.StatusCode);
            Assert.Equal(2, userExpenses?.Count);
        }

        private static List<ExpenseDto> GetExpenses()
        {
            return new List<ExpenseDto>
            {
                new()
                {
                    Amount = 20,
                    CategoryId = 1,
                    CategoryName = "Test",
                    Description = "Test 1",
                    CreateDate = new DateTime(2022, 1, 1),
                    Id = 1,
                    UserId = 1
                },
                new()
                {
                    Amount = 10,
                    CategoryId = 1,
                    CategoryName = "Test",
                    Description = "Test 2",
                    CreateDate = new DateTime(2022, 1, 2),
                    Id = 2,
                    UserId = 1
                }
            };
        }
    }
}