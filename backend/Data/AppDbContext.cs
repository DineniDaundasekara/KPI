using backend.Models;
using Microsoft.EntityFrameworkCore;

namespace backend.Data
{

    public class AppDbContext : DbContext

    {
        // DbSet properties belong at class scope (not inside the constructor).
        public DbSet<RegionData> RegionData { get; set; } = null!;
        public DbSet<RtomArea> RtomArea { get; set; } = null!;
        public DbSet<User> Users { get; set; } = null!;

        public DbSet<Form7_2025> Form7 { get; set; } = null!;

        public DbSet<Form8_2025> Form8Records { get; set; }

        public DbSet<Form9_2025> Form9_2025 { get; set; }

        public AppDbContext(DbContextOptions<AppDbContext> options) : base(options)
        {
        }

        protected override void OnModelCreating(ModelBuilder modelBuilder)
        {
            base.OnModelCreating(modelBuilder);

            // Map to existing table
            modelBuilder.Entity<User>().ToTable("users");

            // Configure primary key
            modelBuilder.Entity<User>().HasKey(u => u.id);

            // Map all columns with proper null handling
            modelBuilder.Entity<User>().Property(u => u.id)
                .HasColumnName("id")
                .HasColumnType("nvarchar(50)")
                .IsRequired();

            modelBuilder.Entity<User>().Property(u => u.username)
                .HasColumnName("username")
                .HasColumnType("smallint")
                .IsRequired(false); // NULLABLE

            modelBuilder.Entity<User>().Property(u => u.name)
                .HasColumnName("name")
                .HasColumnType("nvarchar(50)")
                .IsRequired();

            modelBuilder.Entity<User>().Property(u => u.role)
                .HasColumnName("role")
                .HasColumnType("nvarchar(50)")
                .IsRequired();

            modelBuilder.Entity<User>().Property(u => u.isActive)
                .HasColumnName("isActive")
                .HasColumnType("nvarchar(50)")
                .IsRequired();

            // Map all page columns as nullable
            modelBuilder.Entity<User>().Property(u => u.pages_0)
                .HasColumnName("pages_0")
                .HasColumnType("nvarchar(50)")
                .IsRequired(false);

            modelBuilder.Entity<User>().Property(u => u.pages_1)
                .HasColumnName("pages_1")
                .HasColumnType("nvarchar(50)")
                .IsRequired(false);

            modelBuilder.Entity<User>().Property(u => u.pages_2)
                .HasColumnName("pages_2")
                .HasColumnType("nvarchar(50)")
                .IsRequired(false);

            modelBuilder.Entity<User>().Property(u => u.pages_3)
                .HasColumnName("pages_3")
                .HasColumnType("nvarchar(50)")
                .IsRequired(false);

            modelBuilder.Entity<User>().Property(u => u.pages_4)
                .HasColumnName("pages_4")
                .HasColumnType("nvarchar(50)")
                .IsRequired(false);

            modelBuilder.Entity<User>().Property(u => u.pages_5)
                .HasColumnName("pages_5")
                .HasColumnType("nvarchar(50)")
                .IsRequired(false);

            modelBuilder.Entity<User>().Property(u => u.pages_6)
                .HasColumnName("pages_6")
                .HasColumnType("nvarchar(50)")
                .IsRequired(false);

            modelBuilder.Entity<User>().Property(u => u.pages_7)
                .HasColumnName("pages_7")
                .HasColumnType("nvarchar(50)")
                .IsRequired(false);

            modelBuilder.Entity<User>().Property(u => u.pages_8)
                .HasColumnName("pages_8")
                .HasColumnType("nvarchar(50)")
                .IsRequired(false);

            modelBuilder.Entity<User>().Property(u => u.createdAt)
                .HasColumnName("createdAt")
                .HasColumnType("nvarchar(50)")
                .IsRequired();

            modelBuilder.Entity<User>().Property(u => u.updatedAt)
                .HasColumnName("updatedAt")
                .HasColumnType("nvarchar(50)")
                .IsRequired();

            modelBuilder.Entity<User>().Property(u => u.v)
                .HasColumnName("v");
        }
    }
}
