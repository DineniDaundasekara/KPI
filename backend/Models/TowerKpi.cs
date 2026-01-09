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
        public byte No { get; set; }

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
        [MaxLength(200)]
        public string Kpi { get; set; } = null!;

        [Column("month")]
        public byte? Month { get; set; }

        [Column("year")]
        public short? Year { get; set; }

        [Column("createdAt")]
public string? CreatedAt { get; set; }

[Column("updatedAt")]
public string? UpdatedAt { get; set; }


        [Column("v")]
        public byte V { get; set; }
    }
}
