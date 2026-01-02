using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace backend.Models
{
    [Table("form6_2025")]
    public class IpNwOp
    {
        [Key]
        [Column("id")]
        public string? Id { get; set; } 

        [Column("no")]
        public int? No { get; set; }

        [Column("network_engineer_kpi")]
        public string? NetworkEngineerKpi { get; set; }

        [Column("division")]
        public string? Division { get; set; }

        [Column("section")]
        public string? Section { get; set; }

        [Column("kpi_percent")]
        public double KpiPercent { get; set; }

        [Column("year")]
        public int Year { get; set; }

        // Must be string? to match NVARCHAR database column
        [Column("unavailable_minutes_id")]
        public string? UnavailableMinutesId { get; set; }
    }
}