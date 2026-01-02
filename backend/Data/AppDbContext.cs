using backend.Models;
using Microsoft.EntityFrameworkCore;


namespace backend.Data
{
    public class AppDbContext : DbContext
    {
        public AppDbContext(DbContextOptions<AppDbContext> options) : base(options) { }

        public DbSet<User> Users { get; set; }
        public DbSet<UserPage> UserPages { get; set; }

        public DbSet<ServiceFulfilmentKpi> ServiceFulfilmentKpis { get; set; }

    }
}
