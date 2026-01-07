using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace backend.Models
{
    [Table("kpitowertable_2025")]
    public class TowerKpi
    {
        [Key]
        [Column("id")]
        [MaxLength(24)]
        public string Id { get; set; } = null!;

        [Column("no")]
        public byte No { get; set; }  // Change to byte (tinyint)

        [Column("responsibility")]
        [MaxLength(500)]
        public string Responsibility { get; set; } = null!;

        [Column("frequency")]
        [MaxLength(50)]
        public string Frequency { get; set; } = null!;

        [Column("weightage")]
        [MaxLength(20)]
        public string Weightage { get; set; } = null!;

        [Column("kpi")]
        [MaxLength(20)]
        public string Kpi { get; set; } = null!;

        [Column("createdAt")]
        public DateTime CreatedAt { get; set; }

        [Column("updatedAt")]
        public DateTime UpdatedAt { get; set; }

        [Column("v")]
        public byte V { get; set; }  // Change to byte (tinyint)

        [Column("month")]
        public byte Month { get; set; }  // Change to byte (tinyint)

        [Column("year")]
        public short Year { get; set; } // Use short (smallint)
    }


}
