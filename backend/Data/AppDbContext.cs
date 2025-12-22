using backend.Models;
using Microsoft.EntityFrameworkCore;

namespace backend.Data
{
    public class AppDbContext : DbContext
    {
        public AppDbContext(DbContextOptions<AppDbContext> options) : base(options) { }

        public DbSet<User> Users { get; set; }
        public DbSet<ServiceFulfilmentKpi> ServiceFulfilmentKpis { get; set; }

        protected override void OnModelCreating(ModelBuilder modelBuilder)
        {
            modelBuilder.Entity<User>(entity =>
            {
                entity.ToTable("users");

                entity.HasKey(x => x.Id);
                entity.Property(x => x.Id).HasColumnName("id").HasMaxLength(50);

                entity.Property(x => x.Username).HasColumnName("username").HasMaxLength(6);
                entity.Property(x => x.Name).HasColumnName("name").HasMaxLength(50);
                entity.Property(x => x.Role).HasColumnName("role").HasMaxLength(50);

                entity.Property(x => x.IsActive).HasColumnName("isActive");
                entity.Property(x => x.V).HasColumnName("v");
                entity.Property(x => x.LastLogin).HasColumnName("lastLogin");

                entity.Property(x => x.CreatedAt).HasColumnName("createdAt");
                entity.Property(x => x.UpdatedAt).HasColumnName("updatedAt");

                entity.Property(x => x.Pages_0).HasColumnName("pages_0");
                entity.Property(x => x.Pages_1).HasColumnName("pages_1");
                entity.Property(x => x.Pages_2).HasColumnName("pages_2");
                entity.Property(x => x.Pages_3).HasColumnName("pages_3");
                entity.Property(x => x.Pages_4).HasColumnName("pages_4");
                entity.Property(x => x.Pages_5).HasColumnName("pages_5");
                entity.Property(x => x.Pages_6).HasColumnName("pages_6");
                entity.Property(x => x.Pages_7).HasColumnName("pages_7");
                entity.Property(x => x.Pages_8).HasColumnName("pages_8");
            });

            base.OnModelCreating(modelBuilder);
        }
    }
}
