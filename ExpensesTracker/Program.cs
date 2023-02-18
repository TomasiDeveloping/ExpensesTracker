using Core.Helper.Classes;
using Core.Helper.Services;
using Core.Interfaces;
using DataBase.Profiles;
using DataBase.Services;
using ExpensesTracker.Configurations;
using Serilog;

var builder = WebApplication.CreateBuilder(args);

builder.Host.UseSerilog((context, configuration) =>
{
    configuration.WriteTo.Console()
        .ReadFrom.Configuration(context.Configuration);
});


builder.Services.ConfigureCors();
var jwtSettings = builder.Configuration.GetSection("Token");
builder.Services.ConfigureAuthentication(jwtSettings);
builder.Services.ConfigureSwagger();
builder.Services.ConfigureApiVersioning();
builder.Services.AddAutoMapper(typeof(AutoMapperConfig));
builder.Services.ConfigureDbContext(builder.Configuration);

builder.Services.AddScoped<ITokenService, TokenService>();
builder.Services.AddScoped<IUserService, UserService>();
builder.Services.AddScoped<ICategoryService, CategoryService>();
builder.Services.AddScoped<IExpenseService, ExpenseService>();
builder.Services.AddScoped<IRevenueService, RevenueService>();
builder.Services.AddScoped<IRevenueCategoryService, RevenueCategoryService>();
builder.Services.AddScoped<IReportService, ReportService>();
builder.Services.AddScoped<IRecurringTaskService, RecurringTaskService>();
builder.Services.AddScoped<ICronService, CronService>();
builder.Services.AddScoped<IApplicationVersionConfirmationService, ApplicationVersionConfirmationService>();

builder.Services.Configure<EmailSettings>(builder.Configuration.GetSection("EmailSettings"));

builder.Services.AddControllers();
builder.Services.AddEndpointsApiExplorer();

var app = builder.Build();

if (app.Environment.IsDevelopment())
{
    app.UseSwagger();
    app.UseSwaggerUI();
}

app.UseCors("AllowAll");

app.UseSerilogRequestLogging();

app.UseHttpsRedirection();

app.UseAuthentication();
app.UseAuthorization();

app.MapControllers();

app.Run();

public partial class Program
{
}