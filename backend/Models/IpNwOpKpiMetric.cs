using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;
using System.Text.Json.Serialization;

namespace backend.Models
{
    [Table("IpNwOpKpiMetrics", Schema = "dbo")]
    public class IpNwOpKpiMetric
    {
        [Key]
        public long Id { get; set; }

        // renamed column in DB: ip_nw_op_kpi_id
        [Column("ip_nw_op_kpi_id")]
        public string IpNwOpKpiId { get; set; } = null!;

        [Column("area_code")]
        public string AreaCode { get; set; } = string.Empty;

        [Column("unavailable_minutes")]
        public int? UnavailableMinutes { get; set; }

        [Column("total_minutes")]
        public int? TotalMinutes { get; set; }

        [Column("total_nodes")]
        public int? TotalNodes { get; set; }

        // Navigation
        [JsonIgnore]
        [ForeignKey(nameof(IpNwOpKpiId))]
        public IpNwOpKpi IpNwOpKpi { get; set; } = null!;
    }
}
