using backend.Data;
using Microsoft.EntityFrameworkCore;
using System.Text.Json.Serialization;

var builder = WebApplication.CreateBuilder(args);

// ? Add JSON options to ignore cycles (Form7Kpi -> Nodes -> Kpi -> Nodes...)
builder.Services.AddControllers()
    .AddJsonOptions(options =>
    {
        options.JsonSerializerOptions.ReferenceHandler = ReferenceHandler.IgnoreCycles;
    });

builder.Services.AddEndpointsApiExplorer();
builder.Services.AddSwaggerGen();
// Auth Services
builder.Services.AddAuthentication("Bearer")
    .AddJwtBearer(options =>
    {
        options.TokenValidationParameters = new Microsoft.IdentityModel.Tokens.TokenValidationParameters
        {
            ValidateIssuer = true,
            ValidateAudience = true,
            ValidateLifetime = true,
            ValidateIssuerSigningKey = true,
            ValidIssuer = builder.Configuration["JwtSettings:Issuer"] ?? "KPI_Backend",
            ValidAudience = builder.Configuration["JwtSettings:Audience"] ?? "KPI_Frontend",
            IssuerSigningKey = new Microsoft.IdentityModel.Tokens.SymmetricSecurityKey(
                System.Text.Encoding.UTF8.GetBytes(builder.Configuration["JwtSettings:Secret"] ?? "SuperSecretKeyForDevelopmentOnly12345!@#$%"))
        };
    });

builder.Services.AddScoped<Microsoft.AspNetCore.Authentication.IClaimsTransformation, backend.Helpers.ClaimsTransformation>();
builder.Services.AddSingleton<IHttpContextAccessor, HttpContextAccessor>();
builder.Services.AddScoped<backend.Helpers.IDateHelper, backend.Helpers.DateHelper>();

// Authorization Handlers
builder.Services.AddScoped<Microsoft.AspNetCore.Authorization.IAuthorizationHandler, backend.Helpers.Authorization.PageAccessHandler>();
builder.Services.AddScoped<Microsoft.AspNetCore.Authorization.IAuthorizationHandler, backend.Helpers.Authorization.PlatformKpiEditHandler>();

// Policies
builder.Services.AddAuthorization(options =>
{
    options.AddPolicy("SuperAdminOnly", policy => policy.RequireClaim("role", "SuperAdmin"));
    options.AddPolicy("AdminOnly", policy => policy.RequireClaim("role", "Admin", "SuperAdmin"));
    options.AddPolicy("PlatformAdminOnly", policy => policy.RequireClaim("role", "PlatformAdmin", "SuperAdmin"));
    
    options.AddPolicy("ViewPagePolicy", policy =>
        policy.AddRequirements(new backend.Helpers.Authorization.PageAccessRequirement()));

    options.AddPolicy("EditPlatformKpiPolicy", policy =>
        policy.AddRequirements(new backend.Helpers.Authorization.PlatformKpiEditRequirement()));
});

builder.Services.AddDbContext<AppDbContext>(options =>
    options.UseSqlServer(builder.Configuration.GetConnectionString("DefaultConnection")));

builder.Services.AddCors(options =>
{
    options.AddPolicy("AllowAngular", policy =>
    {
        policy.AllowAnyOrigin()
              .AllowAnyHeader()
              .AllowAnyMethod();
    });
});

var app = builder.Build();

app.UseSwagger();
app.UseSwaggerUI();

app.UseCors("AllowAngular");

app.UseAuthentication();
app.UseAuthorization();

app.MapControllers();

// Auto-migration and cleanup
using (var scope = app.Services.CreateScope())
{
    var services = scope.ServiceProvider;
    try
    {
        var context = services.GetRequiredService<AppDbContext>();
        
        // Fix: Ensure Admin has correct Role (SuperAdmin = 1) and Password hash if missing
        var adminUser = context.Users.FirstOrDefault(u => u.ServiceId == "admin");
        if (adminUser != null)
        {
            if (adminUser.RoleId != 1) // 1 = SuperAdmin
            {
                adminUser.RoleId = 1;
                context.SaveChanges();
                Console.WriteLine("Admin user role updated to SuperAdmin.");
            }
        }
    }
    catch (Exception ex)
    {
        Console.WriteLine($"An error occurred during migration/seeding: {ex.Message}");
    }
}

app.Run();
