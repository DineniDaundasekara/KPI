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

        // ✅ Existing: form6_kpi
        public DbSet<IpNwOpKpi> IpNwOpKpis { get; set; } = null!;

        // ✅ Existing: form8_2025 (Controller uses: _context.Form8Records)
        public DbSet<Form8_2025> Form8Records { get; set; } = null!;

        // ✅ Existing: form9_2025 (Controller uses: _context.Form9_2025)
        public DbSet<Form9_2025> Form9_2025 { get; set; } = null!;

        // ✅ NEW: form4_2025 (Controller uses: _context.Form4_2025)
        public DbSet<Form4_2025> Form4_2025 { get; set; } = null!;

        public DbSet<Form7_2025> Form7 { get; set; } = null!;

        // ✅ TM
        public DbSet<TmActivity1> TmActivity1 { get; set; } = null!;



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
            // finaldatatables mapping
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

                entity.Property(x => x.Weightage)
                      .HasColumnName("weightage")
                      .HasColumnType("decimal(10,4)");

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

            // =========================
            // form6_kpi mapping (IP NW OP)
            // =========================
            modelBuilder.Entity<IpNwOpKpi>(entity =>
            {
                entity.ToTable("form6_kpi", "dbo");

                entity.HasKey(x => x.Id);

                entity.Property(x => x.Id)
                      .HasColumnName("id")
                      .HasMaxLength(50);

                entity.Property(x => x.No)
                      .HasColumnName("no")
                      .HasColumnType("int");

                entity.Property(x => x.NetworkEngineerKpi)
                      .HasColumnName("network_engineer_kpi")
                      .HasMaxLength(500);

                entity.Property(x => x.Division)
                      .HasColumnName("division")
                      .HasMaxLength(200);

                entity.Property(x => x.Section)
                      .HasColumnName("section")
                      .HasMaxLength(200);

                entity.Property(x => x.KpiPercent)
                      .HasColumnName("kpi_percent")
                      .HasColumnType("float");
            });

            // =========================
            // form8_2025 mapping
            // =========================
            modelBuilder.Entity<Form8_2025>(entity =>
            {
                entity.ToTable("form8_2025", "dbo");

                entity.HasKey(x => x.Id);

                entity.Property(x => x.Id).HasColumnName("id").HasMaxLength(50);
                entity.Property(x => x.No).HasColumnName("no").HasColumnType("tinyint");

                entity.Property(x => x.Network_Engineer_Kpi).HasColumnName("network_engineer_kpi").HasMaxLength(255);
                entity.Property(x => x.Division).HasColumnName("division").HasMaxLength(100);
                entity.Property(x => x.Section).HasColumnName("section").HasMaxLength(100);

                entity.Property(x => x.Kpi_Percent).HasColumnName("kpi_percent").HasColumnType("float");

                entity.Property(x => x.Unavailable_Minutes_Id).HasColumnName("unavailable_minutes_id").HasMaxLength(50);
                entity.Property(x => x.Total_Minutes_Id).HasColumnName("total_minutes_id").HasMaxLength(50);
                entity.Property(x => x.Total_Nodes_Id).HasColumnName("total_nodes_id").HasMaxLength(50);

                entity.Property(x => x.Month).HasColumnName("month").HasColumnType("tinyint");
                entity.Property(x => x.Year).HasColumnName("year").HasColumnType("smallint");

                entity.Property(x => x.UpdatedAt).HasColumnName("updatedAt").HasColumnType("nvarchar(50)");
                entity.Property(x => x.v).HasColumnName("v").HasColumnType("float");
            });

            // =========================
            // form9_2025 mapping
            // =========================
            modelBuilder.Entity<Form9_2025>(entity =>
            {
                entity.ToTable("form9_2025", "dbo");

                entity.HasKey(x => x.Id);

                entity.Property(x => x.Id).HasColumnName("id").HasMaxLength(50);
                entity.Property(x => x.No).HasColumnName("no").HasColumnType("tinyint");

                entity.Property(x => x.Network_Engineer_Kpi).HasColumnName("network_engineer_kpi").HasMaxLength(255);
                entity.Property(x => x.Division).HasColumnName("division").HasMaxLength(100);
                entity.Property(x => x.Section).HasColumnName("section").HasMaxLength(100);

                entity.Property(x => x.Kpi_Percent).HasColumnName("kpi_percent").HasColumnType("float");

                entity.Property(x => x.Month).HasColumnName("month").HasColumnType("tinyint");
                entity.Property(x => x.Year).HasColumnName("year").HasColumnType("smallint");

                entity.Property(x => x.UpdatedAt).HasColumnName("updatedAt").HasColumnType("nvarchar(50)");
                entity.Property(x => x.v).HasColumnName("v").HasColumnType("float");
            });

            // =========================
            // ✅ NEW: form4_2025 mapping
            // =========================
            modelBuilder.Entity<Form4_2025>(entity =>
            {
                entity.ToTable("form4_2025", "dbo");

                entity.HasKey(x => x.Id);

                entity.Property(x => x.Id)
                      .HasColumnName("id")
                      .HasMaxLength(50);

                entity.Property(x => x.No)
                      .HasColumnName("no")
                      .HasColumnType("int");

                entity.Property(x => x.Kpi)
                      .HasColumnName("kpi")
                      .HasMaxLength(500);

                entity.Property(x => x.Target)
                      .HasColumnName("target")
                      .HasMaxLength(100);

                entity.Property(x => x.Calculation)
                      .HasColumnName("calculation")
                      .HasMaxLength(500);

                entity.Property(x => x.Platform)
                      .HasColumnName("platform")
                      .HasMaxLength(150);

                entity.Property(x => x.ResponsibleDgm)
                      .HasColumnName("responsibleDgm")
                      .HasMaxLength(150);

                entity.Property(x => x.DefineDoladetails)
                      .HasColumnName("defineDoladetails")
                      .HasMaxLength(500);

                entity.Property(x => x.Weightage)
                      .HasColumnName("weightage")
                      .HasColumnType("int");

                entity.Property(x => x.DataSources)
                      .HasColumnName("dataSources")
                      .HasMaxLength(500);

                entity.Property(x => x.Month)
                      .HasColumnName("month")
                      .HasColumnType("tinyint");

                entity.Property(x => x.Year)
                      .HasColumnName("year")
                      .HasColumnType("smallint");

                entity.Property(x => x.UpdatedAt)
                      .HasColumnName("updatedAt")
                      .HasColumnType("nvarchar(50)");

                entity.Property(x => x.V)
                      .HasColumnName("v")
                      .HasColumnType("int");
            });

            modelBuilder.Entity<Form7_2025>(entity =>
            {
                entity.ToTable("form7_2025", "dbo");

                entity.HasKey(x => x.Id);

                entity.Property(x => x.Id)
                      .HasColumnName("id")
                      .HasMaxLength(50);

                entity.Property(x => x.No)
                      .HasColumnName("no")
                      .HasColumnType("tinyint");

                entity.Property(x => x.NetworkEngineerKpi)
                      .HasColumnName("network_engineer_kpi")
                      .HasMaxLength(500);

                entity.Property(x => x.Division)
                      .HasColumnName("division")
                      .HasMaxLength(200);

                entity.Property(x => x.Section)
                      .HasColumnName("section")
                      .HasMaxLength(200);

                entity.Property(x => x.KpiPercent)
                      .HasColumnName("kpi_percent")
                      .HasColumnType("float");

                entity.Property(x => x.UpdatedAt)
                      .HasColumnName("updatedAt")
                      .HasColumnType("nvarchar(50)")
                      .IsRequired();
            });

            // =========================
            // TM table mapping (tmtable1)
            // =========================
            modelBuilder.Entity<TmActivity1>(entity =>
            {
                entity.ToTable("tmtable1", "dbo");

                entity.HasKey(x => x.Id);

                entity.Property(x => x.No).HasColumnName("no").HasColumnType("tinyint").IsRequired(false);

                entity.Property(x => x.Kpi).HasColumnName("kpi").HasMaxLength(500).IsRequired();
                entity.Property(x => x.Target).HasColumnName("target").HasMaxLength(500).IsRequired(false);
                entity.Property(x => x.Calculation).HasColumnName("calculation").HasMaxLength(500).IsRequired(false);
                entity.Property(x => x.Platform).HasColumnName("platform").HasMaxLength(150).IsRequired(false);

                entity.Property(x => x.ResponsibleDGM).HasColumnName("responsibleDGM").HasMaxLength(150).IsRequired(false);
                entity.Property(x => x.DefinedOLADetails).HasColumnName("definedOLADetails").HasMaxLength(500).IsRequired(false);
                entity.Property(x => x.DataSources).HasColumnName("dataSources").HasMaxLength(500).IsRequired(false);

                entity.Property(x => x.CreatedAt).HasColumnName("createdAt").HasMaxLength(50).IsRequired(false);
                entity.Property(x => x.UpdatedAt).HasColumnName("updatedAt").HasMaxLength(50).IsRequired(false);

                entity.Property(x => x.V).HasColumnName("v").HasColumnType("tinyint").IsRequired(false);
            });



            base.OnModelCreating(modelBuilder);
        }
    }
}
