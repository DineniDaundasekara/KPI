using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace backend.Models
{
    [Table("finaldatatables", Schema = "dbo")]
    public class KpiDefinition
    {
        [Key]
        [Column("id")]
        public string Id { get; set; } = string.Empty;

        // tinyint
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

        // tinyint
        [Column("weightage")]
        public byte Weightage { get; set; }

        // nvarchar in DB
        [Column("createdAt")]
        public string? CreatedAt { get; set; }

        // nvarchar in DB
        [Column("updatedAt")]
        public string? UpdatedAt { get; set; }

        // tinyint
        [Column("v")]
        public byte V { get; set; }

        // tinyint
        [Column("month")]
        public byte Month { get; set; }

        // smallint
        [Column("year")]
        public short Year { get; set; }
    }
}
