using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;
using System.Text.Json.Serialization;

namespace backend.Models
{
    [Table("IpNwOpKpiMetrics", Schema = "dbo")]
    public class IpNwOpKpiMetric
    {
        [Key]
        [Column("id")]
        public int Id { get; set; }   // ✅ INT IDENTITY

        [Column("ip_nw_op_kpi_id")]
        public int IpNwOpKpiId { get; set; }     // ✅ FK INT

        [Column("area_code")]
        public string AreaCode { get; set; } = string.Empty;

        [Column("unavailable_minutes")]
        public int? UnavailableMinutes { get; set; }

        [Column("total_minutes")]
        public int? TotalMinutes { get; set; }

        [Column("total_nodes")]
        public int? TotalNodes { get; set; }

        [Column("month")]
        public byte Month { get; set; }          // ✅ NOT NULL

        [Column("year")]
        public short Year { get; set; }          // ✅ NOT NULL

        // Navigation
        [JsonIgnore]
        [ForeignKey(nameof(IpNwOpKpiId))]
        public IpNwOpKpi IpNwOpKpi { get; set; } = null!;
    }
}