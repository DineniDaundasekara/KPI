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

        protected override void OnModelCreating(ModelBuilder modelBuilder)
        {
            base.OnModelCreating(modelBuilder);

            // Optional: enforce table name here instead of attribute
            // modelBuilder.Entity<ServiceFulfilmentKpi>().ToTable("YOUR_TABLE_NAME_HERE");
        }
    }
}
