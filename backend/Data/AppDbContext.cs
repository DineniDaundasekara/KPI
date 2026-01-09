using backend.Models;
using Microsoft.EntityFrameworkCore;

namespace backend.Data
{
    public class AppDbContext : DbContext
    {
        public AppDbContext(DbContextOptions<AppDbContext> options)
            : base(options)
        {
        }

        // =========================
        // DbSets
        // =========================
        public DbSet<User> Users { get; set; }
        public DbSet<ServiceFulfilmentKpi> ServiceFulfilmentKpis { get; set; }
        public DbSet<KpiDefinition> KpiDefinitions { get; set; }
        public DbSet<RegionData> RegionData { get; set; } = null!;
        public DbSet<RtomArea> RtomArea { get; set; } = null!;
        public DbSet<EmailRecipient> EmailRecipients { get; set; }
        public DbSet<MtncRoutine> MtncRoutines { get; set; }

        public DbSet<Form8_2025> Form8Records { get; set; }
        public DbSet<Form4_2025> Form4_2025 { get; set; }
        public DbSet<Form9_2025> Form9_2025 { get; set; }
        public DbSet<Form7_2025> Form7 { get; set; } = null!;

        // TM activity table
        public DbSet<TmActivity1> TmActivity1 { get; set; }

        protected override void OnModelCreating(ModelBuilder modelBuilder)
        {
            modelBuilder.Entity<TmActivity1>(entity =>
            {
                entity.ToTable("tmtable1", "dbo");

                entity.HasKey(x => x.Id);

                entity.Property(x => x.Id).HasColumnName("id");
                entity.Property(x => x.No).HasColumnName("no");
                entity.Property(x => x.Kpi).HasColumnName("kpi");
                entity.Property(x => x.Target).HasColumnName("target");
                entity.Property(x => x.Calculation).HasColumnName("calculation");
                entity.Property(x => x.Platform).HasColumnName("platform");
                entity.Property(x => x.ResponsibleDGM).HasColumnName("responsibleDGM");
                entity.Property(x => x.DefinedOLADetails).HasColumnName("definedOLADetails");
                entity.Property(x => x.DataSources).HasColumnName("dataSources");
                entity.Property(x => x.CreatedAt).HasColumnName("createdAt");
                entity.Property(x => x.UpdatedAt).HasColumnName("updatedAt");
                entity.Property(x => x.V).HasColumnName("v");
            });

            base.OnModelCreating(modelBuilder);
        }
    }
}
