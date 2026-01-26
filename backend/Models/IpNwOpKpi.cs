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
        public string Id { get; set; } = null!;

        [Column("no")]
        public int? No { get; set; }   // DB: int NULL

        [Column("network_engineer_kpi")]
        public string? NetworkEngineerKpi { get; set; } // DB: nvarchar NULL

        [Column("division")]
        public string? Division { get; set; } // DB: nvarchar NULL

        [Column("section")]
        public string? Section { get; set; } // DB: nvarchar NULL

        [Column("kpi_percent")]
        public double? KpiPercent { get; set; } // DB: float NULL

        [Column("month")]
        public byte? Month { get; set; } // DB: tinyint NULL

        [Column("year")]
        public short? Year { get; set; } // DB: smallint NULL

        [Column("updated_at")]
        public DateTime? UpdatedAt { get; set; } // DB: datetime2 NULL

        // ✅ One KPI -> Many Metrics
        [JsonIgnore]
        public ICollection<IpNwOpKpiMetric> Metrics { get; set; } = new List<IpNwOpKpiMetric>();
    }
}
