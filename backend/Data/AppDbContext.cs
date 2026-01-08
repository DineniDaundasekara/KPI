using backend.Models;
using Microsoft.EntityFrameworkCore;

namespace backend.Data
{
    public class AppDbContext : DbContext
    {
        public AppDbContext(DbContextOptions<AppDbContext> options) : base(options) { }

        public DbSet<User> Users { get; set; }
        public DbSet<ServiceFulfilmentKpi> ServiceFulfilmentKpis { get; set; }
        public DbSet<KpiDefinition> KpiDefinitions { get; set; }
        public DbSet<RegionData> RegionData { get; set; } = null!;
        public DbSet<RtomArea> RtomArea { get; set; } = null!;

        public DbSet<EmailRecipient> EmailRecipients { get; set; }
        public DbSet<MtncRoutine> MtncRoutines { get; set; }
        public DbSet<Form8_2025> Form8Records { get; set; }
        public DbSet<Form9_2025> Form9_2025 { get; set; }


        protected override void OnModelCreating(ModelBuilder modelBuilder)
        {
            // =========================
            // users table mapping
            // =========================
            modelBuilder.Entity<User>(entity =>
            {
                entity.ToTable("users", "dbo");

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

            // =========================
            // finaldatatables mapping (UPDATED)
            // =========================
            modelBuilder.Entity<KpiDefinition>(entity =>
            {
                entity.ToTable("finaldatatables", "dbo");

                entity.HasKey(x => x.Id);
                entity.Property(x => x.Id)
                      .HasColumnName("id")
                      .HasMaxLength(50);

                entity.Property(x => x.RowNumber)
                      .HasColumnName("rowNumber")
                      .HasColumnType("tinyint");

                // ✅ Weightage is now calculated, store decimals
                entity.Property(x => x.Weightage)
                      .HasColumnName("weightage")
                      .HasColumnType("decimal(10,4)");

                // ✅ PointsApplicable should be NOT NULL in DB (default 0)
                entity.Property(x => x.PointsApplicable)
                      .HasColumnName("pointsApplicable")
                      .HasColumnType("int")
                      .IsRequired();

                entity.Property(x => x.V)
                      .HasColumnName("v")
                      .HasColumnType("tinyint");

                entity.Property(x => x.Month)
                      .HasColumnName("month")
                      .HasColumnType("tinyint");

                entity.Property(x => x.Year)
                      .HasColumnName("year")
                      .HasColumnType("smallint");

                entity.Property(x => x.Perspectives)
                      .HasColumnName("perspectives")
                      .HasMaxLength(50);

                entity.Property(x => x.StrategicObjectives)
                      .HasColumnName("strategicObjectives")
                      .HasMaxLength(100);

                entity.Property(x => x.KeyPerformanceIndicators)
                      .HasColumnName("keyPerformanceIndicators")
                      .HasMaxLength(500);

                entity.Property(x => x.Unit)
                      .HasColumnName("unit")
                      .HasMaxLength(50);

                entity.Property(x => x.DescriptionOfKPI)
                      .HasColumnName("descriptionOfKPI")
                      .HasMaxLength(200);

                entity.Property(x => x.CreatedAt)
                      .HasColumnName("createdAt")
                      .HasColumnType("nvarchar(50)");

                entity.Property(x => x.UpdatedAt)
                      .HasColumnName("updatedAt")
                      .HasColumnType("nvarchar(50)");
            });

            // =========================
            // emailrecipients mapping
            // =========================
            modelBuilder.Entity<EmailRecipient>(entity =>
            {
                entity.ToTable("emailrecipients", "dbo");

                entity.HasKey(x => x.Id);

                entity.Property(x => x.Id)
                      .HasColumnName("id")
                      .HasMaxLength(50);

                entity.Property(x => x.Email)
                      .HasColumnName("email")
                      .HasMaxLength(255);

                entity.Property(x => x.V)
                      .HasColumnName("v")
                      .HasColumnType("tinyint");

                entity.HasIndex(x => x.Email).IsUnique();
            });

            // =========================
            // mtncroutinetable1 mapping
            // =========================
            modelBuilder.Entity<MtncRoutine>(entity =>
            {
                entity.ToTable("mtncroutinetable1", "dbo");

                entity.HasKey(x => x.Id);

                entity.Property(x => x.Id)
                      .HasColumnName("id")
                      .HasMaxLength(50);

                entity.Property(x => x.No)
                      .HasColumnName("no")
                      .HasColumnType("tinyint");

                entity.Property(x => x.Kpi)
                      .HasColumnName("kpi")
                      .HasMaxLength(500);

                entity.Property(x => x.Target)
                      .HasColumnName("target")
                      .HasMaxLength(50);

                entity.Property(x => x.Calculation)
                      .HasColumnName("calculation")
                      .HasMaxLength(300);

                entity.Property(x => x.Platform)
                      .HasColumnName("platform")
                      .HasMaxLength(100);

                entity.Property(x => x.ResponsibleDGM)
                      .HasColumnName("responsibleDGM")
                      .HasMaxLength(100);

                entity.Property(x => x.DefinedOLADetails)
                      .HasColumnName("definedOLADetails")
                      .HasMaxLength(200);

                entity.Property(x => x.DataSources)
                      .HasColumnName("dataSources")
                      .HasMaxLength(200);

                entity.Property(x => x.CreatedAt)
                      .HasColumnName("createdAt")
                      .HasColumnType("nvarchar(50)");

                entity.Property(x => x.UpdatedAt)
                      .HasColumnName("updatedAt")
                      .HasColumnType("nvarchar(50)");

                entity.Property(x => x.V)
                      .HasColumnName("v")
                      .HasColumnType("tinyint");
            });

            base.OnModelCreating(modelBuilder);
        }
    }
}
