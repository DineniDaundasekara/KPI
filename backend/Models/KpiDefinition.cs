using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace backend.Models
{

    
    [Table("finaldatatables", Schema = "dbo")]
    public class KpiDefinition
    {
        [Key]
        [Column("id")]
        [DatabaseGenerated(DatabaseGeneratedOption.Identity)]
        public int Id { get; set; }

        [Column("rowNumber")]
        public byte RowNumber { get; set; }

        [Column("perspectives")]
        public string Perspectives { get; set; } = string.Empty;

        [Column("strategicObjectives")]
        public string StrategicObjectives { get; set; } = string.Empty;

        [Column("keyPerformanceIndicators")]
        public string KeyPerformanceIndicators { get; set; } = string.Empty;

        [Column("unit")]
        public string Unit { get; set; } = string.Empty;

        [Column("descriptionOfKPI")]
        public string DescriptionOfKPI { get; set; } = string.Empty;

        // ✅ Weightage auto-calculated (% with decimals)
        // Recommended DB column type: decimal(10,4)
        [Column("weightage", TypeName = "decimal(10,4)")]
        public decimal Weightage { get; set; } = 0m;

        // ✅ User enters points; NOT NULL default 0
        [Column("pointsApplicable")]
        public int PointsApplicable { get; set; } = 0;

        [Column("createdAt")]
        public string? CreatedAt { get; set; }

        [Column("updatedAt")]
        public string? UpdatedAt { get; set; }

        [Column("v")]
        public byte V { get; set; }

        [Column("month")]
        public byte Month { get; set; }

        [Column("year")]
        public short Year { get; set; }
    }
}
