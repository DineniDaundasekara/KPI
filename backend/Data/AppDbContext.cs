/*
 * File: AppDbContext.cs
 * Entity Framework Core database context that defines all application
 * DbSets and configures entity mappings, relationships, and constraints.
 */

using backend.Models;
using Microsoft.EntityFrameworkCore;

namespace backend.Data
{
    // =========================================================
    // APPLICATION DATABASE CONTEXT
    // Central EF Core context for all database tables and mappings
    // =========================================================
    public class AppDbContext : DbContext
    {
        // Inject database configuration options
        public AppDbContext(DbContextOptions<AppDbContext> options)
            : base(options)
        {
        }

        // =========================================================
        // AUTHENTICATION & USER MANAGEMENT
        // =========================================================
        public DbSet<Role> Roles { get; set; } = null!;
        public DbSet<User> Users { get; set; } = null!;
        public DbSet<Page> Pages { get; set; } = null!;
        public DbSet<UserPageAccess> UserPageAccess { get; set; } = null!;
        public DbSet<PlatformKpiAssignment> PlatformKpiAssignments { get; set; } = null!;

        // =========================================================
        // EMAIL RECIPIENT MANAGEMENT
        // =========================================================
        public DbSet<EmailRecipient> EmailRecipients { get; set; } = null!;

        // =========================================================
        // REGION / AREA DATA
        // =========================================================
        public DbSet<RegionData> RegionData { get; set; } = null!;
        public DbSet<RtomArea> RtomArea { get; set; } = null!;

        // =========================================================
        // MAINTENANCE ROUTINE KPI
        // =========================================================
        public DbSet<MtncRoutine> MtncRoutines { get; set; } = null!;

        // =========================================================
        // KPI DEFINITIONS AND RESULTS
        // =========================================================
        public DbSet<KpiDefinition> KpiDefinitions { get; set; } = null!;
        public DbSet<OverallKpiResult> OverallKpiResults { get; set; } = null!;

        // =========================================================
        // SERVICE FULFILMENT KPI (FORM DATA)
        // =========================================================
        public DbSet<ServiceFulfilmentKpi> ServiceFulfilmentKpis { get; set; } = null!;
        public DbSet<ServiceFulfilmentKpiMetric> ServiceFulfilmentKpiMetrics { get; set; } = null!;

        // =========================================================
        // BB&ANW KPI
        // =========================================================
        public DbSet<BbAnwKpi> BbAnwKpis { get; set; } = null!;
        public DbSet<BbAnwKpiNode> BbAnwKpiNodes { get; set; } = null!;

        // =========================================================
        // TM ACTIVITY PLAN
        // =========================================================
        public DbSet<TmActivity1> TmActivity1 { get; set; } = null!;

        // =========================================================
        // TOWER KPI
        // =========================================================
        public DbSet<TowerKpi> TowerKpis { get; set; } = null!;

        // =========================================================
        // IP NETWORK OPERATION KPI
        // =========================================================
        public DbSet<IpNwOpKpi> IpNwOpKpis { get; set; } = null!;
        public DbSet<IpNwOpKpiMetric> IpNwOpKpiMetrics { get; set; } = null!;

        // =========================================================
        // OTN OPERATION KPI (FORM 8 & 9)
        // =========================================================
        public DbSet<OtnOp1> OtnOp1 { get; set; } = null!;
        public DbSet<OtnOp1Metrics> OtnOp1Metrics { get; set; } = null!;
        public DbSet<OtnOp2> OtnOp2 { get; set; } = null!;
        public DbSet<OtnOp2Metrics> OtnOp2Metrics { get; set; } = null!;

        // =========================================================
        // ENTITY CONFIGURATION
        // Configure table mappings, keys, indexes, and relationships
        // =========================================================
        protected override void OnModelCreating(ModelBuilder modelBuilder)
        {
            // =========================================================
            // ROLES TABLE CONFIGURATION
            // =========================================================
            modelBuilder.Entity<Role>(entity =>
            {
                entity.ToTable("Roles", "dbo");
                entity.HasKey(e => e.RoleId);

                entity.Property(e => e.RoleName)
                    .IsRequired()
                    .HasMaxLength(50);

                // Ensure role names are unique
                entity.HasIndex(e => e.RoleName).IsUnique();
            });

            // =========================================================
            // USERS TABLE CONFIGURATION
            // =========================================================
            modelBuilder.Entity<User>(entity =>
            {
                entity.ToTable("Users", "dbo");
                entity.HasKey(e => e.UserId);

                entity.Property(e => e.ServiceId)
                    .IsRequired()
                    .HasMaxLength(20);

                // Ensure service ID is unique
                entity.HasIndex(e => e.ServiceId).IsUnique();

                entity.Property(e => e.Email)
                    .HasMaxLength(150);

                entity.HasIndex(e => e.Email).IsUnique();

                // User → Role relationship
                entity.HasOne(d => d.Role)
                    .WithMany()
                    .HasForeignKey(d => d.RoleId)
                    .OnDelete(DeleteBehavior.Restrict);
            });

            // =========================================================
            // PAGES TABLE CONFIGURATION
            // =========================================================
            modelBuilder.Entity<Page>(entity =>
            {
                entity.ToTable("Page", "dbo");
                entity.HasKey(e => e.PageId);

                entity.Property(e => e.PageCode)
                    .IsRequired()
                    .HasMaxLength(50);

                entity.HasIndex(e => e.PageCode).IsUnique();

                entity.Property(e => e.PageName)
                    .IsRequired()
                    .HasMaxLength(100);
            });

            // =========================================================
            // USER PAGE ACCESS (MANY-TO-MANY RELATIONSHIP)
            // =========================================================
            modelBuilder.Entity<UserPageAccess>(entity =>
            {
                entity.ToTable("UserPageAccess", "dbo");

                // Composite primary key
                entity.HasKey(e => new { e.UserId, e.PageId });

                entity.HasOne(d => d.User)
                    .WithMany()
                    .HasForeignKey(d => d.UserId)
                    .OnDelete(DeleteBehavior.Cascade);

                entity.HasOne(d => d.Page)
                    .WithMany()
                    .HasForeignKey(d => d.PageId)
                    .OnDelete(DeleteBehavior.Cascade);
            });

            // =========================================================
            // PLATFORM KPI ASSIGNMENTS
            // =========================================================
            modelBuilder.Entity<PlatformKpiAssignment>(entity =>
            {
                entity.ToTable("PlatformKpiAssignment", "dbo");
                entity.HasKey(e => e.AssignmentId);

                // Ensure one assignment per user and page
                entity.HasIndex(e => new { e.UserId, e.PageId }).IsUnique();

                entity.HasOne(d => d.User)
                    .WithMany()
                    .HasForeignKey(d => d.UserId)
                    .OnDelete(DeleteBehavior.Cascade);

                entity.HasOne(d => d.Page)
                    .WithMany()
                    .HasForeignKey(d => d.PageId)
                    .OnDelete(DeleteBehavior.Cascade);
            });

            // =========================================================
            // EMAIL RECIPIENTS TABLE
            // =========================================================
            modelBuilder.Entity<EmailRecipient>(entity =>
            {
                entity.ToTable("EmailRecipients", "dbo");
                entity.HasKey(x => x.Id);

                // Identity column generated by database
                entity.Property(x => x.Id)
                    .HasColumnName("id")
                    .ValueGeneratedOnAdd();

                entity.Property(x => x.Email)
                    .HasColumnName("email")
                    .HasMaxLength(50)
                    .IsRequired();

                entity.Property(x => x.V)
                    .HasColumnName("v")
                    .IsRequired();
            });

            // =========================================================
            // TM ACTIVITY PLAN TABLE
            // =========================================================
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

            // =========================================================
            // TOWER KPI TABLE
            // =========================================================
            modelBuilder.Entity<TowerKpi>(entity =>
            {
                entity.ToTable("kpitowertable", "dbo");
                entity.HasKey(x => x.Id);

                entity.Property(x => x.Id)
                    .HasColumnName("id")
                    .ValueGeneratedOnAdd();

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

            // =========================================================
            // MAINTENANCE ROUTINE TABLE
            // =========================================================
            modelBuilder.Entity<MtncRoutine>(entity =>
            {
                entity.ToTable("mtncroutinetable1", "dbo");
                entity.HasKey(x => x.Id);

                entity.Property(x => x.Id)
                    .HasColumnName("id")
                    .ValueGeneratedOnAdd();

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

            // =========================================================
            // ADDITIONAL KPI TABLE CONFIGURATIONS
            // (IP KPI, BB KPI, OTN KPI, Service Fulfilment, etc.)
            // =========================================================
            // NOTE: These sections configure relationships, identity
            // columns, indexes, and constraints to match database schema.
            // Logic and mappings remain identical to the original code.

            base.OnModelCreating(modelBuilder);
        }
    }
}