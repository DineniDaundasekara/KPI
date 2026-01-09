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
        // USERS
        // =========================
        public DbSet<User> Users { get; set; } = null!;

        // =========================
        // EMAILS
        // =========================
        public DbSet<EmailRecipient> EmailRecipients { get; set; } = null!;

        // =========================
        // REGION / AREA
        // =========================
        public DbSet<RegionData> RegionData { get; set; } = null!;
        public DbSet<RtomArea> RtomArea { get; set; } = null!;

        // =========================
        // MAINTENANCE ROUTINE
        // =========================
        public DbSet<MtncRoutine> MtncRoutines { get; set; } = null!;

        // =========================
        // KPI DEFINITIONS
        // =========================
        public DbSet<KpiDefinition> KpiDefinitions { get; set; } = null!;

        // =========================
        // FORMS (2025)
        // =========================
        public DbSet<Form4_2025> Form4_2025 { get; set; } = null!;
        public DbSet<Form7_2025> Form7 { get; set; } = null!;
        public DbSet<Form8_2025> Form8Records { get; set; } = null!;
        public DbSet<Form9_2025> Form9_2025 { get; set; } = null!;

        // =========================
        // TM ACTIVITY PLAN
        // =========================
        public DbSet<TmActivity1> TmActivity1 { get; set; } = null!;

        // =========================
        // KPI TOWER
        // =========================
        public DbSet<TowerKpi> TowerKpis { get; set; } = null!;

        protected override void OnModelCreating(ModelBuilder modelBuilder)
        {
            // --------------------------------------------------
            // TM ACTIVITY PLAN
            // --------------------------------------------------
            modelBuilder.Entity<TmActivity1>(entity =>
            {
                entity.ToTable("tmtable1");

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

            // --------------------------------------------------
            // KPI TOWER
            // --------------------------------------------------
            modelBuilder.Entity<TowerKpi>(entity =>
            {
                entity.ToTable("kpitowertable_2025");

                entity.HasKey(x => x.Id);

                entity.Property(x => x.Id).HasColumnName("id");
                entity.Property(x => x.No).HasColumnName("no");
                entity.Property(x => x.Responsibility).HasColumnName("responsibility");
                entity.Property(x => x.Frequency).HasColumnName("frequency");
                entity.Property(x => x.Weightage).HasColumnName("weightage");
                entity.Property(x => x.Kpi).HasColumnName("kpi");
                entity.Property(x => x.CreatedAt).HasColumnName("createdAt");
                entity.Property(x => x.UpdatedAt).HasColumnName("updatedAt");
                entity.Property(x => x.V).HasColumnName("v");
                entity.Property(x => x.Month).HasColumnName("month");
                entity.Property(x => x.Year).HasColumnName("year");
            });

            base.OnModelCreating(modelBuilder);
        }
    }
}
