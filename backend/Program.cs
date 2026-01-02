using backend.Data;
using Microsoft.EntityFrameworkCore;
using YourProjectNamespace.Data;

var builder = WebApplication.CreateBuilder(args);

// Add services to the container.
builder.Services.AddControllers();
builder.Services.AddEndpointsApiExplorer();
builder.Services.AddSwaggerGen();

// Set up the database connection
builder.Services.AddDbContext<AppDbContext>(opt =>
    opt.UseSqlServer(builder.Configuration.GetConnectionString("DefaultConnection"))
);

// Set up CORS policy
builder.Services.AddCors(opt =>
{
    opt.AddPolicy("AllowAngular", p =>
        p.AllowAnyHeader().AllowAnyMethod().SetIsOriginAllowed(_ => true).AllowCredentials()
    );
});

var app = builder.Build();

// Use Swagger for API documentation
app.UseSwagger();
app.UseSwaggerUI();

// Enable HTTPS redirection
app.UseHttpsRedirection();

// Apply CORS policy
app.UseCors("AllowAngular");

// Map controllers to endpoints
app.MapControllers();

// Start the application
app.Run();
