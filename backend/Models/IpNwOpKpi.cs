using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;
using System.Text.Json.Serialization;

namespace backend.Models
{
    [Table("IpNwOpKpi", Schema = "dbo")]
    public class IpNwOpKpi
    {
        [Key]
        [Column("id")]
        public int Id { get; set; }   // ✅ INT IDENTITY

        [Column("network_engineer_kpi")]
        public string? NetworkEngineerKpi { get; set; }

        [Column("division")]
        public string? Division { get; set; }

        [Column("section")]
        public string? Section { get; set; }

        [Column("kpi_percent")]
        public double? KpiPercent { get; set; }  // SQL float

        [Column("updated_at")]
        public DateTime? UpdatedAt { get; set; } // datetime2(7)

        // ✅ One KPI -> Many Metrics
        [JsonIgnore]
        public ICollection<IpNwOpKpiMetric> Metrics { get; set; } = new List<IpNwOpKpiMetric>();
    }
}
