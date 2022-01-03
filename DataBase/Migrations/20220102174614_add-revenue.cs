using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace DataBase.Migrations
{
    public partial class addrevenue : Migration
    {
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.CreateTable(
                name: "RevenuesCategories",
                columns: table => new
                {
                    Id = table.Column<int>(type: "int", nullable: false)
                        .Annotation("SqlServer:Identity", "1, 1"),
                    Name = table.Column<string>(type: "nvarchar(100)", maxLength: 100, nullable: false),
                    UserId = table.Column<int>(type: "int", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_RevenuesCategories", x => x.Id);
                    table.ForeignKey(
                        name: "FK_RevenuesCategories_Users_UserId",
                        column: x => x.UserId,
                        principalTable: "Users",
                        principalColumn: "Id");
                });

            migrationBuilder.CreateTable(
                name: "Revenues",
                columns: table => new
                {
                    Id = table.Column<int>(type: "int", nullable: false)
                        .Annotation("SqlServer:Identity", "1, 1"),
                    UserId = table.Column<int>(type: "int", nullable: false),
                    RevenueCategoryId = table.Column<int>(type: "int", nullable: false),
                    Description = table.Column<string>(type: "nvarchar(255)", maxLength: 255, nullable: true),
                    Amount = table.Column<decimal>(type: "decimal(18,2)", nullable: false),
                    CreateDate = table.Column<DateTime>(type: "datetime2", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_Revenues", x => x.Id);
                    table.ForeignKey(
                        name: "FK_Revenues_RevenuesCategories_RevenueCategoryId",
                        column: x => x.RevenueCategoryId,
                        principalTable: "RevenuesCategories",
                        principalColumn: "Id");
                    table.ForeignKey(
                        name: "FK_Revenues_Users_UserId",
                        column: x => x.UserId,
                        principalTable: "Users",
                        principalColumn: "Id");
                });

            migrationBuilder.CreateIndex(
                name: "IX_Revenues_RevenueCategoryId",
                table: "Revenues",
                column: "RevenueCategoryId");

            migrationBuilder.CreateIndex(
                name: "IX_Revenues_UserId",
                table: "Revenues",
                column: "UserId");

            migrationBuilder.CreateIndex(
                name: "IX_RevenuesCategories_UserId",
                table: "RevenuesCategories",
                column: "UserId");
        }

        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropTable(
                name: "Revenues");

            migrationBuilder.DropTable(
                name: "RevenuesCategories");
        }
    }
}
