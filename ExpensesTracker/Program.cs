using Core.Helper.Classes;
using Core.Helper.Services;
using Core.Interfaces;
using DataBase;
using DataBase.Profiles;
using DataBase.Services;
using Microsoft.AspNetCore.Authentication.JwtBearer;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using Microsoft.IdentityModel.Tokens;
using Microsoft.OpenApi.Models;
using System.Text;

//##############################################################################
//#################### When GUI is hosted separately ###########################
//##############################################################################

var builder = WebApplication.CreateBuilder(args);

builder.Services.AddControllers();
builder.Services.AddEndpointsApiExplorer();

builder.Services.AddSwaggerGen(c =>
{
    c.SwaggerDoc("v1", new OpenApiInfo { Title = "Expense Tracker", Version = "v1" });

    var securitySchema = new OpenApiSecurityScheme()
    {
        Description = "JWT Auth Bearer Scheme",
        Name = "Authorization",
        In = ParameterLocation.Header,
        Type = SecuritySchemeType.Http,
        Scheme = "bearer",
        Reference = new OpenApiReference()
        {
            Type = ReferenceType.SecurityScheme,
            Id = "Bearer"
        }
    };

    c.AddSecurityDefinition("Bearer", securitySchema);
    var securityRequirement = new OpenApiSecurityRequirement
    {
        {
            securitySchema, new[]
                {"Bearer"}
        }
    };
    c.AddSecurityRequirement(securityRequirement);
});

builder.Services.AddApiVersioning(option =>
{
    option.DefaultApiVersion = new ApiVersion(1, 0);
    option.AssumeDefaultVersionWhenUnspecified = true;
    option.ReportApiVersions = true;
});

builder.Services.AddAutoMapper(typeof(AutoMapperConfig));

builder.Services.AddDbContext<ExpensesTrackerContext>(options =>
{
    options.UseSqlServer(builder.Configuration.GetConnectionString("DefaultConnection"));
});

builder.Services.AddScoped<ITokenService, TokenService>();
builder.Services.AddScoped<IUserService, UserService>();
builder.Services.AddScoped<ICategoryService, CategoryService>();
builder.Services.AddScoped<IExpenseService, ExpenseService>();
builder.Services.AddScoped<IRevenueService, RevenueService>();
builder.Services.AddScoped<IRevenueCategoryService, RevenueCategoryService>();
builder.Services.AddScoped<IReportService, ReportService>();

builder.Services.AddAuthentication(JwtBearerDefaults.AuthenticationScheme)
    .AddJwtBearer(options =>
    {
        options.TokenValidationParameters = new TokenValidationParameters
        {
            ValidateIssuerSigningKey = true,
            IssuerSigningKey = new SymmetricSecurityKey(Encoding.UTF8.GetBytes(builder.Configuration["Token:Key"])),
            ValidateIssuer = false,
            ValidateAudience = false
        };
    });

builder.Services.Configure<EmailSettings>(builder.Configuration.GetSection("EmailSettings"));

builder.Services.AddCors();

var app = builder.Build();

if (app.Environment.IsDevelopment())
{
    app.UseSwagger();
    app.UseSwaggerUI();
}

app.UseCors(option =>
{
    option.AllowAnyHeader();
    option.AllowAnyMethod();
    option.AllowAnyOrigin();
});

app.UseHttpsRedirection();

app.UseAuthentication();
app.UseAuthorization();

app.MapControllers();

app.Run();

public partial class Program { }

//##############################################################################
//################# Who GUI and API are hosted together ########################
//##############################################################################

//var builder = WebApplication.CreateBuilder(args);

//builder.Services.AddControllersWithViews();

//builder.Services.AddSwaggerGen();
//builder.Services.AddApiVersioning(option =>
//{
//    option.DefaultApiVersion = new ApiVersion(1, 0);
//    option.AssumeDefaultVersionWhenUnspecified = true;
//    option.ReportApiVersions = true;
//});

//builder.Services.AddAutoMapper(typeof(AutoMapperConfig));

//builder.Services.AddDbContext<ExpensesTrackerContext>(options =>
//{
//    options.UseSqlServer(builder.Configuration.GetConnectionString("DefaultConnection"));
//});

//builder.Services.AddScoped<ITokenService, TokenService>();
//builder.Services.AddScoped<IUserService, UserService>();
//builder.Services.AddScoped<ICategoryService, CategoryService>();
//builder.Services.AddScoped<IExpenseService, ExpenseService>();

//builder.Services.AddAuthentication(JwtBearerDefaults.AuthenticationScheme)
//    .AddJwtBearer(options =>
//    {
//        options.TokenValidationParameters = new TokenValidationParameters
//        {
//            ValidateIssuerSigningKey = true,
//            IssuerSigningKey = new SymmetricSecurityKey(Encoding.UTF8.GetBytes(builder.Configuration["Token:Key"])),
//            ValidateIssuer = false,
//            ValidateAudience = false
//        };
//    });

// builder.Services.Configure<EmailSettings>(builder.Configuration.GetSection("EmailSettings"));

//builder.Services.AddCors();

//var app = builder.Build();

//if (app.Environment.IsDevelopment())
//{
//    app.UseSwagger();
//    app.UseSwaggerUI();
//}

//if (!app.Environment.IsDevelopment())
//{
//    app.UseHsts();
//}

//app.UseCors(option =>
//{
//    option.AllowAnyHeader();
//    option.AllowAnyMethod();
//    option.AllowAnyOrigin();
//});

//app.UseHttpsRedirection();
//app.UseStaticFiles();
//app.UseRouting();

//app.UseAuthentication();
//app.UseAuthorization();

//app.MapControllerRoute(
//    name: "default",
//    pattern: "{controller}/{action=Index}/{id?}");

//app.MapFallbackToFile("index.html");

//app.Run();

//public partial class Program { }