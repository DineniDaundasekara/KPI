/*
 * File: Program.cs
 * ASP.NET Core application startup and configuration file.
 * Handles dependency injection, authentication/authorization setup, database initialization,
 * CORS configuration, and data seeding for KPI Management System.
 */

using backend.Data;
using backend.Services;
using Microsoft.EntityFrameworkCore;
using System.Text.Json.Serialization;

var builder = WebApplication.CreateBuilder(args);

// =========================================================
// JSON SERIALIZATION CONFIGURATION
// Configure JSON serializer to ignore cycles in related entities
// Prevents circular reference errors when serializing entities with relationships
// Example: Form7Kpi -> Nodes -> Kpi -> Nodes cycle
// =========================================================
builder.Services.AddControllers()
    .AddJsonOptions(options =>
    {
        options.JsonSerializerOptions.ReferenceHandler = ReferenceHandler.IgnoreCycles;
    });

builder.Services.AddEndpointsApiExplorer();
builder.Services.AddSwaggerGen();

// =========================================================
// JWT BEARER AUTHENTICATION CONFIGURATION
// Configures JWT token validation for API authentication.
// Validates token signature, issuer, audience, and lifetime.
// Token parameters configured from appsettings.json JwtSettings section.
// =========================================================
builder.Services.AddAuthentication("Bearer")
    .AddJwtBearer(options =>
    {
        options.TokenValidationParameters = new Microsoft.IdentityModel.Tokens.TokenValidationParameters
        {
            // Require valid issuer in token
            ValidateIssuer = true,
            // Require valid audience in token
            ValidateAudience = true,
            // Require valid expiration time
            ValidateLifetime = true,
            // Require valid signature
            ValidateIssuerSigningKey = true,
            // Expected token issuer (from appsettings)
            ValidIssuer = builder.Configuration["JwtSettings:Issuer"] ?? "KPI_Backend",
            // Expected token audience (from appsettings)
            ValidAudience = builder.Configuration["JwtSettings:Audience"] ?? "KPI_Frontend",
            // Signing key for validating token signature (from appsettings)
            IssuerSigningKey = new Microsoft.IdentityModel.Tokens.SymmetricSecurityKey(
                System.Text.Encoding.UTF8.GetBytes(builder.Configuration["JwtSettings:Secret"] ?? "SuperSecretKeyForDevelopmentOnly12345!@#$%"))
        };
    });

// =========================================================
// AUTHENTICATION AND AUTHORIZATION SERVICES
// Register custom claims transformation and authorization handlers
// =========================================================

// Custom claims transformation: Adds role claims from database
builder.Services.AddScoped<Microsoft.AspNetCore.Authentication.IClaimsTransformation, backend.Helpers.ClaimsTransformation>();

// HTTP context accessor: Allows access to current user context in services
builder.Services.AddSingleton<IHttpContextAccessor, HttpContextAccessor>();

// Custom date helper: Provides date utilities for KPI calculations
builder.Services.AddScoped<backend.Helpers.IDateHelper, backend.Helpers.DateHelper>();

// Authorization handlers: Page access and KPI edit authorization logic
builder.Services.AddScoped<Microsoft.AspNetCore.Authorization.IAuthorizationHandler, backend.Helpers.Authorization.PageAccessHandler>();
builder.Services.AddScoped<Microsoft.AspNetCore.Authorization.IAuthorizationHandler, backend.Helpers.Authorization.PlatformKpiEditHandler>();

// =========================================================
// AUTHORIZATION POLICIES
// Define role-based and requirement-based authorization policies
// Used with [Authorize(Policy = "PolicyName")] on controllers/actions
// =========================================================
builder.Services.AddAuthorization(options =>
{
    // SuperAdmin role only: Can access all administrative functions
    options.AddPolicy("SuperAdminOnly", policy => policy.RequireClaim("role", "SuperAdmin"));
    
    // Admin or SuperAdmin: Can access admin-level operations
    options.AddPolicy("AdminOnly", policy => policy.RequireClaim("role", "Admin", "SuperAdmin"));
    
    // PlatformAdmin or SuperAdmin: Can manage platform-specific KPIs
    options.AddPolicy("PlatformAdminOnly", policy => policy.RequireClaim("role", "PlatformAdmin", "SuperAdmin"));
    
    // Page access policy: Validates user has access to specific page
    // Uses PageAccessHandler to check PageAccessControl table
    options.AddPolicy("ViewPagePolicy", policy =>
        policy.AddRequirements(new backend.Helpers.Authorization.PageAccessRequirement()));

    // KPI edit policy: Validates user can edit specific KPI/platform
    // Uses PlatformKpiEditHandler for platform-specific edit restrictions
    options.AddPolicy("EditPlatformKpiPolicy", policy =>
        policy.AddRequirements(new backend.Helpers.Authorization.PlatformKpiEditRequirement()));
});


// =========================================================
// DATABASE CONFIGURATION
// Register SQL Server DbContext with connection string from appsettings
// =========================================================
builder.Services.AddDbContext<AppDbContext>(options =>
    options.UseSqlServer(builder.Configuration.GetConnectionString("DefaultConnection")));

// =========================================================
// CORS CONFIGURATION
// Allow Angular frontend to make requests to this API
// Configured for development: allows any origin, header, method
// SECURITY NOTE: Restrict in production (specific origins, methods, headers)
// =========================================================
builder.Services.AddCors(options =>
{
    options.AddPolicy("AllowAngular", policy =>
    {
        policy.AllowAnyOrigin()              // Allow requests from any origin
              .AllowAnyHeader()               // Allow any request headers
              .AllowAnyMethod();              // Allow any HTTP methods (GET, POST, etc)
    });
});

// =========================================================
// EXTERNAL SERVICE REGISTRATION
// Register multi-table service for SOAP UI data fetching
// HttpClient configured for external API communication
// =========================================================
builder.Services.AddHttpClient<IMultiTableService, MultiTableService>();


// =========================================================
// MIDDLEWARE PIPELINE CONFIGURATION
// Build and configure the application request pipeline
// Order matters: authentication -> authorization -> routes
// =========================================================
var app = builder.Build();

// Enable Swagger documentation endpoint (http://localhost/swagger)
app.UseSwagger();
app.UseSwaggerUI();

// Enable CORS for Angular frontend requests
app.UseCors("AllowAngular");

// Use JWT authentication middleware
app.UseAuthentication();

// Use authorization middleware for policy-based authorization
app.UseAuthorization();

// Map attribute-routed controller endpoints
app.MapControllers();

// =========================================================
// DATABASE INITIALIZATION AND SEEDING
// Auto-migrate database schema and seed essential data:
// - Roles: SuperAdmin, Admin, PlatformAdmin, User
// - Pages: KPI pages accessible in the system
// - Default Users: Admin and PlatformAdmin accounts
// =========================================================
using (var scope = app.Services.CreateScope())
{
    var services = scope.ServiceProvider;
    try
    {
        var context = services.GetRequiredService<AppDbContext>();

        // =========================================================
        // SEED ROLES
        // Add default roles if they don't exist:
        // SuperAdmin: Full system access
        // Admin: Administrative functions
        // PlatformAdmin: Platform-specific KPI management
        // User: Standard read-only user
        // =========================================================
        var roleNames = new[] { "SuperAdmin", "Admin", "PlatformAdmin", "User" };
        var existingRoles = context.Roles.Select(r => r.RoleName).ToList();
        var missingRoles = roleNames.Except(existingRoles).ToList();
        if (missingRoles.Any())
        {
            foreach (var roleName in missingRoles)
            {
                context.Roles.Add(new backend.Models.Role { RoleName = roleName });
            }
            context.SaveChanges();
        }

        // =========================================================
        // SEED PAGES
        // Add KPI pages if they don't exist:
        // Each page represents a different KPI dashboard/module
        // PageCode used for authorization checks
        // =========================================================
        var pageSeeds = new[]
        {
            new backend.Models.Page { PageId = 1, PageCode = "IP_NW_OP", PageName = "IP NW OP" },
            new backend.Models.Page { PageId = 2, PageCode = "SERVICE_FULFILMENT", PageName = "SERVICE FULFILMENT" },
            new backend.Models.Page { PageId = 3, PageCode = "BB_ANW", PageName = "BB ANW" },
            new backend.Models.Page { PageId = 4, PageCode = "OTN_OP", PageName = "OTN OP" },
            new backend.Models.Page { PageId = 5, PageCode = "TM_ACTIVITY", PageName = "TM Activity Plan" },
            new backend.Models.Page { PageId = 6, PageCode = "ROUTINE_MTNC", PageName = "ROUTINE MTNC" },
            new backend.Models.Page { PageId = 7, PageCode = "TOWER_MTCE", PageName = "TOWER MTCE ACHIEVEMENT" }
        };

        var existingPageIds = context.Pages.Select(p => p.PageId).ToList();
        var missingPages = pageSeeds.Where(p => !existingPageIds.Contains(p.PageId)).ToList();
        if (missingPages.Any())
        {
            context.Pages.AddRange(missingPages);
            context.SaveChanges();
        }
        
        // =========================================================
        // SEED/VALIDATE DEFAULT ADMIN USER
        // Ensure Admin user exists and has SuperAdmin role (RoleId = 1)
        // Used for initial system access and administrative operations
        // =========================================================
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

        // =========================================================
        // SEED/VALIDATE DEFAULT PLATFORM ADMIN USER
        // Ensure PlatformAdmin user (ServiceId: 30001) exists
        // PlatformAdmins manage KPIs for specific platforms
        // =========================================================
        var platformAdminRole = context.Roles.FirstOrDefault(r => r.RoleName == "PlatformAdmin");
        if (platformAdminRole != null)
        {
            const string defaultPlatformAdminServiceId = "30001";
            var platformAdmin = context.Users.FirstOrDefault(u => u.ServiceId == defaultPlatformAdminServiceId);
            if (platformAdmin == null)
            {
                // Create new PlatformAdmin user if doesn't exist
                context.Users.Add(new backend.Models.User
                {
                    ServiceId = defaultPlatformAdminServiceId,
                    Name = "Platform Admin",
                    RoleId = platformAdminRole.RoleId,
                    IsActive = true,
                    CreatedAt = DateTime.UtcNow,
                    Email = $"{defaultPlatformAdminServiceId}@internal.slt"
                });
                context.SaveChanges();
                Console.WriteLine("Default PlatformAdmin user created.");
            }
            else
            {
                // Ensure existing PlatformAdmin is active and has correct role
                if (!platformAdmin.IsActive || platformAdmin.RoleId != platformAdminRole.RoleId)
                {
                    platformAdmin.IsActive = true;
                    platformAdmin.RoleId = platformAdminRole.RoleId;
                    platformAdmin.UpdatedAt = DateTime.UtcNow;
                    context.SaveChanges();
                    Console.WriteLine("PlatformAdmin user updated.");
                }
            }
        }
    }
    catch (Exception ex)
    {
        Console.WriteLine($"An error occurred during migration/seeding: {ex.Message}");
    }
}

app.Run();
