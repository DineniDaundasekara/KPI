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

        

        // =========================
        // BB&ANW (FORM 7 renamed)
        // =========================
        public DbSet<BbAnwKpi> BbAnwKpis { get; set; } = null!;
        public DbSet<BbAnwKpiNode> BbAnwKpiNodes { get; set; } = null!;


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
        public DbSet<IpNwOpKpiMetric> IpNwOpKpiMetrics { get; set; } = null!;

        //OTNOP1 AND OTNOP2
        public DbSet<OtnOp1> OtnOp1 { get; set; } = null!;
        public DbSet<OtnOp1Metrics> OtnOp1Metrics { get; set; } = null!;
        public DbSet<OtnOp2> OtnOp2 { get; set; } = null!;
        public DbSet<OtnOp2Metrics> OtnOp2Metrics { get; set; } = null!;


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

            // IP NW OP KPI
            modelBuilder.Entity<IpNwOpKpi>(entity =>
            {
                entity.ToTable("IpNwOpKpi", "dbo");
                entity.HasKey(x => x.Id);

                entity.Property(x => x.Id).HasColumnName("id").HasMaxLength(64);
                entity.Property(x => x.No).HasColumnName("no");
                entity.Property(x => x.NetworkEngineerKpi).HasColumnName("network_engineer_kpi");
                entity.Property(x => x.Division).HasColumnName("division");
                entity.Property(x => x.Section).HasColumnName("section");
                entity.Property(x => x.KpiPercent).HasColumnName("kpi_percent");

                entity.Property(x => x.Month).HasColumnName("month");
                entity.Property(x => x.Year).HasColumnName("year");
                entity.Property(x => x.UpdatedAt).HasColumnName("updated_at");
            });

            modelBuilder.Entity<IpNwOpKpiMetric>(entity =>
            {
                entity.ToTable("IpNwOpKpiMetrics", "dbo");
                entity.HasKey(x => x.Id);

                entity.Property(x => x.Id)
                    .HasColumnName("id")
                    .ValueGeneratedOnAdd();

                entity.Property(x => x.IpNwOpKpiId)
                    .HasColumnName("ip_nw_op_kpi_id")
                    .HasMaxLength(64);

                entity.Property(x => x.AreaCode).HasColumnName("area_code").HasMaxLength(50);

                entity.Property(x => x.UnavailableMinutes).HasColumnName("unavailable_minutes");
                entity.Property(x => x.TotalMinutes).HasColumnName("total_minutes");
                entity.Property(x => x.TotalNodes).HasColumnName("total_nodes");

                entity.HasOne(x => x.IpNwOpKpi)
                    .WithMany(k => k.Metrics)
                    .HasForeignKey(x => x.IpNwOpKpiId)
                    .HasConstraintName("FK_IpNwOpKpiMetrics_IpNwOpKpi");
            });

            // =========================
            // BB&ANW KPI (Form7 renamed tables)
            // =========================
            modelBuilder.Entity<BbAnwKpi>(entity =>
            {
                entity.ToTable("BbAnwKpi", "dbo");
                entity.HasKey(x => x.KpiId);

                entity.Property(x => x.KpiId).HasColumnName("KpiId");
                entity.Property(x => x.MongoObjectId).HasColumnName("MongoObjectId").HasMaxLength(24);

                entity.Property(x => x.No).HasColumnName("No");
                entity.Property(x => x.NetworkEngineerKpi).HasColumnName("NetworkEngineerKpi").HasMaxLength(200);
                entity.Property(x => x.Division).HasColumnName("Division").HasMaxLength(100);
                entity.Property(x => x.Section).HasColumnName("Section").HasMaxLength(50);

                entity.Property(x => x.KpiPercent)
                      .HasColumnName("KpiPercent")
                      .HasColumnType("decimal(6,2)");

                entity.HasMany(x => x.Nodes)
                      .WithOne(n => n.Kpi)
                      .HasForeignKey(n => n.KpiId)
                      .HasConstraintName("FK_BbAnwKpiNode_BbAnwKpi");
            });

            modelBuilder.Entity<BbAnwKpiNode>(entity =>
            {
                entity.ToTable("BbAnwKpiNode", "dbo");

                // composite primary key
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

            //OTNOP1 AND OTNOP2 
            // =========================
            // OtnOp1 (Form8) + Metrics
            // =========================
            modelBuilder.Entity<OtnOp1>(entity =>
            {
                entity.ToTable("OtnOp1", "dbo");
                entity.HasKey(x => x.Id);

                entity.Property(x => x.Id)
                      .HasColumnName("Id")
                      .ValueGeneratedOnAdd(); // INT IDENTITY

                entity.Property(x => x.NetworkEngineerKpi)
                      .HasColumnName("NetworkEngineerKpi")
                      .HasMaxLength(255)
                      .IsRequired();

                entity.Property(x => x.Division)
                      .HasColumnName("Division")
                      .HasMaxLength(100);

                entity.Property(x => x.Section)
                      .HasColumnName("Section")
                      .HasMaxLength(100);

                entity.Property(x => x.KpiPercent)
                      .HasColumnName("KpiPercent")
                      .HasColumnType("decimal(6,3)");
            });

            modelBuilder.Entity<OtnOp1Metrics>(entity =>
            {
                entity.ToTable("OtnOp1Metrics", "dbo");
                entity.HasKey(x => x.Id);

                entity.Property(x => x.Id)
                      .HasColumnName("Id")
                      .ValueGeneratedOnAdd();

                entity.Property(x => x.OtnOp1Id)
                      .HasColumnName("OtnOp1Id")
                      .IsRequired();

                entity.Property(x => x.Site)
                      .HasColumnName("Site")
                      .HasMaxLength(20)
                      .IsRequired();

                entity.Property(x => x.UnavailableMinutes).HasColumnName("UnavailableMinutes");
                entity.Property(x => x.TotalMinutes).HasColumnName("TotalMinutes");
                entity.Property(x => x.TotalNodes).HasColumnName("TotalNodes");

                entity.Property(x => x.Year).HasColumnName("Year");
                entity.Property(x => x.Month).HasColumnName("Month");

                entity.HasOne(x => x.OtnOp1)
                      .WithMany(k => k.Metrics)
                      .HasForeignKey(x => x.OtnOp1Id)
                      .HasConstraintName("FK_Otn1M_Otn1")
                      .OnDelete(DeleteBehavior.Cascade);

                // matches: UQ_Otn1M UNIQUE (OtnOp1Id, Site, Year, Month)
                entity.HasIndex(x => new { x.OtnOp1Id, x.Site, x.Year, x.Month })
                      .IsUnique()
                      .HasDatabaseName("UQ_Otn1M");
            });


            // =========================
            // OtnOp2 (Form9) + Metrics
            // =========================
            modelBuilder.Entity<OtnOp2>(entity =>
            {
                entity.ToTable("OtnOp2", "dbo");
                entity.HasKey(x => x.Id);

                entity.Property(x => x.Id)
                      .HasColumnName("Id")
                      .ValueGeneratedOnAdd();

                entity.Property(x => x.NetworkEngineerKpi)
                      .HasColumnName("NetworkEngineerKpi")
                      .HasMaxLength(255)
                      .IsRequired();

                entity.Property(x => x.Division)
                      .HasColumnName("Division")
                      .HasMaxLength(100);

                entity.Property(x => x.Section)
                      .HasColumnName("Section")
                      .HasMaxLength(100);

                entity.Property(x => x.KpiPercent)
                      .HasColumnName("KpiPercent")
                      .HasColumnType("decimal(6,3)");
            });

            modelBuilder.Entity<OtnOp2Metrics>(entity =>
            {
                entity.ToTable("OtnOp2Metrics", "dbo");
                entity.HasKey(x => x.Id);

                entity.Property(x => x.Id)
                      .HasColumnName("Id")
                      .ValueGeneratedOnAdd();

                entity.Property(x => x.OtnOp2Id)
                      .HasColumnName("OtnOp2Id")
                      .IsRequired();

                entity.Property(x => x.Site)
                      .HasColumnName("Site")
                      .HasMaxLength(20)
                      .IsRequired();

                entity.Property(x => x.TotalFailedLinks).HasColumnName("TotalFailedLinks");
                entity.Property(x => x.LinksSlaNotViolated).HasColumnName("LinksSlaNotViolated");

                entity.Property(x => x.Year).HasColumnName("Year");
                entity.Property(x => x.Month).HasColumnName("Month");

                entity.HasOne(x => x.OtnOp2)
                      .WithMany(k => k.Metrics)
                      .HasForeignKey(x => x.OtnOp2Id)
                      .HasConstraintName("FK_Otn2M_Otn2")
                      .OnDelete(DeleteBehavior.Cascade);

                entity.HasIndex(x => new { x.OtnOp2Id, x.Site, x.Year, x.Month })
                      .IsUnique()
                      .HasDatabaseName("UQ_Otn2M");
            });





            base.OnModelCreating(modelBuilder);
        }
    }
}
