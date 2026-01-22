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
        public DbSet<ServiceFulfilmentKpi> ServiceFulfilmentKpis { get; set; } = null!;
        public DbSet<ServiceFulfilmentKpiMetric> ServiceFulfilmentKpiMetrics { get; set; } = null!;

        public DbSet<Form8_2025> Form8Records { get; set; } = null!;

        public DbSet<Form9_2025> Form9_2025 { get; set; } = null!;

        // =========================
        // FORM 7 (BB&ANW) - NEW TABLES
        // =========================
        public DbSet<Form7Kpi> Form7Kpis { get; set; } = null!;
        public DbSet<Form7KpiNode> Form7KpiNodes { get; set; } = null!;


        // =========================
        // TM ACTIVITY PLAN
        // =========================
        public DbSet<TmActivity1> TmActivity1 { get; set; } = null!;

        // =========================
        // KPI TOWER
        // =========================
        public DbSet<TowerKpi> TowerKpis { get; set; } = null!;

        // =========================
        // IP NW OP KPI (FORM 6)
        // =========================
        public DbSet<IpNwOpKpi> IpNwOpKpis { get; set; } = null!;
        public DbSet<Form6KpiMetric> Form6KpiMetrics { get; set; } = null!;

        protected override void OnModelCreating(ModelBuilder modelBuilder)
        {
            // TM ACTIVITY PLAN
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

            // KPI TOWER
            modelBuilder.Entity<TowerKpi>(entity =>
            {
                entity.ToTable("kpitowertable_2025", "dbo");
                entity.HasKey(x => x.Id);
                entity.Property(x => x.Id).HasColumnName("id");
                entity.Property(x => x.No).HasColumnName("no");
                entity.Property(x => x.Responsibility).HasColumnName("responsibility");
                entity.Property(x => x.Frequency).HasColumnName("frequency");
                entity.Property(x => x.Weightage).HasColumnName("weightage");
                entity.Property(x => x.Kpi).HasColumnName("kpi");
                entity.Property(x => x.Month).HasColumnName("month");
                entity.Property(x => x.Year).HasColumnName("year");
                entity.Property(x => x.CreatedAt).HasColumnName("createdAt");
                entity.Property(x => x.UpdatedAt).HasColumnName("updatedAt");
                entity.Property(x => x.V).HasColumnName("v");
            });

            // MAINTENANCE ROUTINE
            modelBuilder.Entity<MtncRoutine>(entity =>
            {
                entity.ToTable("mtncroutinetable1", "dbo");
                entity.HasKey(x => x.Id);
                entity.Property(x => x.Id).HasColumnName("id").HasMaxLength(50);
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

            // IP NW OP KPI (form6_kpi)
            modelBuilder.Entity<IpNwOpKpi>(entity =>
            {
                entity.ToTable("form6_kpi", "dbo");
                entity.HasKey(x => x.Id);

                entity.Property(x => x.Id).HasColumnName("id").HasMaxLength(64);
                entity.Property(x => x.No).HasColumnName("no"); // int? in model
                entity.Property(x => x.NetworkEngineerKpi).HasColumnName("network_engineer_kpi");
                entity.Property(x => x.Division).HasColumnName("division");
                entity.Property(x => x.Section).HasColumnName("section");
                entity.Property(x => x.KpiPercent).HasColumnName("kpi_percent");
            });

            // Metrics (form6_kpi_metrics)  ✅ ONLY ONE BLOCK
            modelBuilder.Entity<Form6KpiMetric>(entity =>
            {
                entity.ToTable("form6_kpi_metrics", "dbo");
                entity.HasKey(x => x.Id);

                entity.Property(x => x.Id)
                    .HasColumnName("id")
                    .ValueGeneratedOnAdd(); // because IDENTITY

                entity.Property(x => x.Form6Id).HasColumnName("form6_id").HasMaxLength(64);
                entity.Property(x => x.AreaCode).HasColumnName("area_code").HasMaxLength(50);

                entity.Property(x => x.UnavailableMinutes).HasColumnName("unavailable_minutes");
                entity.Property(x => x.TotalMinutes).HasColumnName("total_minutes");
                entity.Property(x => x.TotalNodes).HasColumnName("total_nodes");

                entity.HasOne(x => x.Form6)
                    .WithMany(f => f.Metrics)
                    .HasForeignKey(x => x.Form6Id)
                    .HasConstraintName("FK_form6_metrics_form6");
            });

            //bbanw
            // =========================
            // FORM 7 (BB&ANW)
            // =========================
            modelBuilder.Entity<Form7Kpi>(entity =>
            {
                entity.ToTable("Form7Kpi", "dbo");
                entity.HasKey(x => x.KpiId);

                entity.Property(x => x.KpiId).HasColumnName("KpiId");
                entity.Property(x => x.MongoObjectId).HasColumnName("MongoObjectId").HasMaxLength(24);

                entity.Property(x => x.No).HasColumnName("No");
                entity.Property(x => x.NetworkEngineerKpi).HasColumnName("NetworkEngineerKpi").HasMaxLength(200);
                entity.Property(x => x.Division).HasColumnName("Division").HasMaxLength(100);
                entity.Property(x => x.Section).HasColumnName("Section").HasMaxLength(50);

                // SQL: DECIMAL(6,2)
                entity.Property(x => x.KpiPercent)
                      .HasColumnName("KpiPercent")
                      .HasColumnType("decimal(6,2)");

                entity.HasMany(x => x.Nodes)
                      .WithOne(n => n.Kpi)
                      .HasForeignKey(n => n.KpiId);
            });

            modelBuilder.Entity<Form7KpiNode>(entity =>
            {
                entity.ToTable("Form7KpiNode", "dbo");

                // ✅ composite primary key
                entity.HasKey(x => new { x.KpiId, x.NodeCode });

                entity.Property(x => x.KpiId).HasColumnName("KpiId");
                entity.Property(x => x.NodeCode).HasColumnName("NodeCode").HasMaxLength(50);

                entity.Property(x => x.UnavailableMinutes).HasColumnName("UnavailableMinutes");
                entity.Property(x => x.TotalMinutes).HasColumnName("TotalMinutes");
                entity.Property(x => x.TotalNodes).HasColumnName("TotalNodes");
            });

            //servicefullilment
            modelBuilder.Entity<ServiceFulfilmentKpiMetric>(entity =>
            {
                entity.ToTable("ServiceFulfilmentKpiMetrics", "dbo");
                entity.HasKey(x => x.Id);

                entity.Property(x => x.Id)
                      .HasColumnName("id")
                      .ValueGeneratedOnAdd();

                        entity.Property(x => x.ServiceFulfilmentKpiId)
                            .HasColumnName("service_fulfilment_kpi_id")
                            .HasMaxLength(50);

                entity.Property(x => x.AreaCode)
                      .HasColumnName("area_code")
                      .HasMaxLength(50);

                entity.Property(x => x.KpiValue).HasColumnName("kpi_value");
                entity.Property(x => x.Month).HasColumnName("month");
                entity.Property(x => x.Year).HasColumnName("year");

                entity.HasOne(x => x.ServiceFulfilmentKpi)
                      .WithMany(k => k.Metrics) // only if you add ICollection navigation
                      .HasForeignKey(x => x.ServiceFulfilmentKpiId)
                      .HasConstraintName("FK_ServiceFulfilmentKpiMetrics_ServiceFulfilmentKpi")
                      .OnDelete(DeleteBehavior.Cascade);
            });

            modelBuilder.Entity<ServiceFulfilmentKpi>(entity =>
            {
                entity.ToTable("ServiceFulfilmentKpi", "dbo");
                entity.HasKey(x => x.Id);

                entity.Property(x => x.Id).HasColumnName("id").HasMaxLength(36);

                entity.Property(x => x.No).HasColumnName("no");
                entity.Property(x => x.Kpi).HasColumnName("kpi");
                entity.Property(x => x.Target).HasColumnName("target");
                entity.Property(x => x.Calculation).HasColumnName("calculation");
                entity.Property(x => x.Platform).HasColumnName("platform");
                entity.Property(x => x.ResponsibleDgm).HasColumnName("responsibleDgm");
                entity.Property(x => x.DefineDoladetails).HasColumnName("definedOLADetails");
                entity.Property(x => x.Weightage).HasColumnName("weightage");
                entity.Property(x => x.DataSources).HasColumnName("dataSources");

                entity.Property(x => x.Month).HasColumnName("month");
                entity.Property(x => x.Year).HasColumnName("year");

                entity.Property(x => x.UpdatedAt).HasColumnName("updatedAt");
                entity.Property(x => x.V).HasColumnName("v");
            });



            base.OnModelCreating(modelBuilder);
        }
    }
}
