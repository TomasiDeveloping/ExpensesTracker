using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace DataBase.Migrations
{
    public partial class addRecurringTasks : Migration
    {
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.CreateTable(
                name: "RecurringTasks",
                columns: table => new
                {
                    Id = table.Column<int>(type: "int", nullable: false)
                        .Annotation("SqlServer:Identity", "1, 1"),
                    UserId = table.Column<int>(type: "int", nullable: false),
                    IsActive = table.Column<bool>(type: "bit", nullable: false),
                    IsRevenue = table.Column<bool>(type: "bit", nullable: false),
                    IsExpense = table.Column<bool>(type: "bit", nullable: false),
                    CategoryId = table.Column<int>(type: "int", nullable: true),
                    RevenueCategoryId = table.Column<int>(type: "int", nullable: true),
                    LastExecution = table.Column<DateTime>(type: "datetime2", nullable: false),
                    NextExecution = table.Column<DateTime>(type: "datetime2", nullable: false),
                    ExecuteAll = table.Column<int>(type: "int", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_RecurringTasks", x => x.Id);
                    table.ForeignKey(
                        name: "FK_RecurringTasks_Categories_CategoryId",
                        column: x => x.CategoryId,
                        principalTable: "Categories",
                        principalColumn: "Id");
                    table.ForeignKey(
                        name: "FK_RecurringTasks_RevenuesCategories_RevenueCategoryId",
                        column: x => x.RevenueCategoryId,
                        principalTable: "RevenuesCategories",
                        principalColumn: "Id");
                    table.ForeignKey(
                        name: "FK_RecurringTasks_Users_UserId",
                        column: x => x.UserId,
                        principalTable: "Users",
                        principalColumn: "Id");
                });

            migrationBuilder.CreateIndex(
                name: "IX_RecurringTasks_CategoryId",
                table: "RecurringTasks",
                column: "CategoryId");

            migrationBuilder.CreateIndex(
                name: "IX_RecurringTasks_RevenueCategoryId",
                table: "RecurringTasks",
                column: "RevenueCategoryId");

            migrationBuilder.CreateIndex(
                name: "IX_RecurringTasks_UserId",
                table: "RecurringTasks",
                column: "UserId");
        }

        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropTable(
                name: "RecurringTasks");
        }
    }
}
