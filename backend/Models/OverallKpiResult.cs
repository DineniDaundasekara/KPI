using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace backend.Models
{
    [Table("OverallKpiResult", Schema = "dbo")]
    public class OverallKpiResult
    {
        [Key]
        [Column("Id")]
        public int Id { get; set; }

        [Column("KpiCode")]
        public string? KpiCode { get; set; }

        [Column("KpiDefinitionId")]
        public int KpiDefinitionId { get; set; }

        [Column("KpiName")]
        public string? KpiName { get; set; }

        [Column("Platform")]
        public string? Platform { get; set; }

        [Column("AreaCode")]
        public string AreaCode { get; set; } = string.Empty;

        [Column("TargetValue", TypeName = "decimal(18,4)")]
        public decimal? TargetValue { get; set; }

        [Column("AchievedValue", TypeName = "decimal(10,4)")]
        public decimal AchievedKpi { get; set; }

        [Column("PointsApplicable", TypeName = "decimal(18,4)")]
        public decimal MaximumPointsPerKpi { get; set; }

        [Column("PointsAchieved", TypeName = "decimal(18,4)")]
        public decimal PointsAchieved { get; set; }

        [Column("Month")]
        public byte Month { get; set; }

        [Column("Year")]
        public short Year { get; set; }

        [Column("CalculatedAt")]
        public DateTime? CalculatedAt { get; set; }
    }
}
