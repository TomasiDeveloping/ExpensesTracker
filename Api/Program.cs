using Api.Configurations;
using Core.Helper.Classes;
using Core.Helper.Services;
using Core.Interfaces;
using DataBase.Profiles;
using DataBase.Services;
using HealthChecks.UI.Client;
using Microsoft.AspNetCore.Diagnostics.HealthChecks;
using Serilog;



// Configure Serilog logger
Log.Logger = new LoggerConfiguration()
    .WriteTo.Console()
    .CreateBootstrapLogger();

try
{
    var builder = WebApplication.CreateBuilder(args);

    // Add Serilog to services
    builder.Services.AddSerilog(configureLogger =>
    {
        configureLogger.ReadFrom.Configuration(builder.Configuration);
    });

    Log.Logger.Information("Starting web host");

    builder.Services.ConfigureCors();
    var jwtSettings = builder.Configuration.GetSection("Token");
    builder.Services.ConfigureAuthentication(jwtSettings);
    builder.Services.ConfigureSwagger();
    builder.Services.ConfigureApiVersioning();
    builder.Services.AddAutoMapper(typeof(AutoMapperConfig));
    builder.Services.ConfigureDbContext(builder.Configuration);
    builder.Services.ConfigureHealthChecks(builder.Configuration);

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

    app.UseSwagger();
    app.UseSwaggerUI();

    app.UseCors("AllowAll");

    app.UseSerilogRequestLogging();

    app.UseHttpsRedirection();

    app.UseAuthentication();
    app.UseAuthorization();

    app.MapControllers();

    app.MapHealthChecks("/health", new HealthCheckOptions
    {
        ResponseWriter = UIResponseWriter.WriteHealthCheckUIResponse
    });

    app.Run();
}
catch (Exception e)
{
    Log.Fatal(e, "Host terminated unexpectedly");
}
finally
{
    Log.CloseAndFlush();
}