using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace DataBase.Migrations
{
    public partial class updateRecurringTask : Migration
    {
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.RenameColumn(
                name: "ExecuteAll",
                table: "RecurringTasks",
                newName: "ExecuteInMonths");

            migrationBuilder.AddColumn<decimal>(
                name: "Amount",
                table: "RecurringTasks",
                type: "decimal(18,2)",
                precision: 18,
                scale: 2,
                nullable: false,
                defaultValue: 0m);

            migrationBuilder.AddColumn<string>(
                name: "Description",
                table: "RecurringTasks",
                type: "nvarchar(200)",
                maxLength: 200,
                nullable: true);
        }

        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropColumn(
                name: "Amount",
                table: "RecurringTasks");

            migrationBuilder.DropColumn(
                name: "Description",
                table: "RecurringTasks");

            migrationBuilder.RenameColumn(
                name: "ExecuteInMonths",
                table: "RecurringTasks",
                newName: "ExecuteAll");
        }
    }
}
