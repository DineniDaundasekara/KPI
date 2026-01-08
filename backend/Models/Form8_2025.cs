using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace backend.Models
{
    [Table("form8_2025")]
    public class Form8_2025
    {
        [Key]
        [Column("id")]
        public string Id { get; set; } = null!;

        [Column("no")]
        public byte No { get; set; }

        [Column("network_engineer_kpi")]
        public string Network_Engineer_Kpi { get; set; } = null!;

        [Column("division")]
        public string Division { get; set; } = null!;

        [Column("section")]
        public string Section { get; set; } = null!;

        // ✅ SQL FLOAT → C# double
        [Column("kpi_percent")]
        public double Kpi_Percent { get; set; }

        [Column("unavailable_minutes_id")]
        public string Unavailable_Minutes_Id { get; set; } = null!;

        [Column("total_minutes_id")]
        public string Total_Minutes_Id { get; set; } = null!;

        [Column("total_nodes_id")]
        public string Total_Nodes_Id { get; set; } = null!;

        [Column("month")]
        public byte Month { get; set; }

        [Column("year")]
        public short Year { get; set; }

        [Column("updatedAt")]
        public string UpdatedAt { get; set; } = null!;

        // ✅ FIXED: was float?, must be double?
        [Column("v")]
        public double? v { get; set; }
    }
}
