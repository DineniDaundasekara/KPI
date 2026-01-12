using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace backend.Models
{
    [Table("form7_2025", Schema = "dbo")]
    public class Form7_2025
    {
        [Key]
        [Column("id")]
        public string Id { get; set; } = Guid.NewGuid().ToString();

        [Column("no")]
        public int No { get; set; }

        [Column("network_engineer_kpi")]
        public string NetworkEngineerKpi { get; set; } = string.Empty;

        [Column("division")]
        public string Division { get; set; } = string.Empty;

        [Column("section")]
        public string Section { get; set; } = string.Empty;

        [Column("kpi_percent")]
        public double KpiPercent { get; set; }

        // 🔴 REQUIRED BY DB
        [Column("unavailable_minutes")]
        public int UnavailableMinutes { get; set; }

        [Column("total_minutes")]
        public int TotalMinutes { get; set; }

        [Column("total_nodes")]
        public int TotalNodes { get; set; }

        [Column("month")]
        public byte Month { get; set; }

        [Column("year")]
        public short Year { get; set; }

        [Column("updatedAt")]
        public string UpdatedAt { get; set; } = string.Empty;
    }
}
