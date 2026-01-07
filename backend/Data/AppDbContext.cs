using backend.Models;
using Microsoft.EntityFrameworkCore;

namespace backend.Data
{
    public class AppDbContext : DbContext
    {

        public DbSet<TowerKpi> TowerKpis => Set<TowerKpi>();
        public AppDbContext(DbContextOptions<AppDbContext> options) : base(options) { }

        public DbSet<User> Users { get; set; } = null!;
        public DbSet<UserPage> UserPages { get; set; } = null!;
        public DbSet<ServiceFulfilmentKpi> ServiceFulfilmentKpis { get; set; } = null!;

       

        public DbSet<IpNwOp> IpNwOps { get; set; }
    }
}
