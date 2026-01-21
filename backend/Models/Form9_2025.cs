using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace backend.Models
{
    [Table("form9_2025")]
    public class Form9_2025
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

        [Column("kpi_percent")]
        public double Kpi_Percent { get; set; }

        [Column("month")]
        public byte Month { get; set; }

        [Column("year")]
        public short Year { get; set; }

        [Column("updatedAt")]
        public string UpdatedAt { get; set; } = null!;

        [Column("v")]
        public double? v { get; set; }

        // ✅ NEW
        [Column("metrics_id")]
        public int Metrics_Id { get; set; }
    }
}
