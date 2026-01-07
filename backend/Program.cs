using backend.Data;
using backend.Services;
using backend.Data;
using backend.Services;
using Microsoft.EntityFrameworkCore;
using System.Text.Json;

var builder = WebApplication.CreateBuilder(args);

// Configure JSON options to use camelCase for property names
builder.Services.AddControllers()
    .AddJsonOptions(opt =>
    {
        opt.JsonSerializerOptions.PropertyNamingPolicy = JsonNamingPolicy.CamelCase;
    });

// Configure the database connection
builder.Services.AddDbContext<AppDbContext>(options =>
    options.UseSqlServer(builder.Configuration.GetConnectionString("DefaultConnection"))
);

// ✅ Register IpNwOpService as Scoped (NOT Singleton)
builder.Services.AddScoped<IpNwOpService>();

// Add Swagger for API documentation (only in Development)
if (builder.Environment.IsDevelopment())
{
    builder.Services.AddEndpointsApiExplorer();
    builder.Services.AddSwaggerGen();
}

// Enable CORS policy (allow specific origins in production)
builder.Services.AddCors(options =>
{
    options.AddPolicy("AllowSpecificOrigin",
        policy => policy.WithOrigins("http://localhost:4200")
                        .AllowAnyHeader()
                        .AllowAnyMethod());
});

// Add health checks (optional but recommended for monitoring)
builder.Services.AddHealthChecks();

var app = builder.Build();

// Use Swagger UI only in development
if (app.Environment.IsDevelopment())
{
    app.UseSwagger();
    app.UseSwaggerUI();
}

// Use CORS policy
app.UseCors("AllowSpecificOrigin");

// Use exception handling middleware (optional)
app.UseExceptionHandler("/error");

// Map health checks endpoint (optional)
app.MapHealthChecks("/health");

// Map controllers to handle API routes
app.MapControllers();

app.Run();
