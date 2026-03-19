/*
 * File: TowerKpi.cs
 * Entity model representing Tower KPI performance indicators.
 * Maps to the kpitowertable table in the database.
 */

using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace backend.Models
{
    // =========================================================
    // TOWER KPI MODEL
    // Represents Tower KPI definitions and performance metrics
    // =========================================================
    [Table("kpitowertable")]
    public class TowerKpi
    {
        // Unique identifier for the KPI record
        [Key]
        [Column("id")]
        public int Id { get; set; }

        // Sequential number for the Tower KPI
        [Column("no")]
        public byte No { get; set; }

        // Responsibility description (max 100 characters)
        [Column("responsibility")]
        [MaxLength(100)]
        public string Responsibility { get; set; } = null!;

        // Frequency of measurement or review (max 50 characters)
        [Column("frequency")]
        [MaxLength(50)]
        public string Frequency { get; set; } = null!;

        // Weightage percentage for the KPI (max 50 characters)
        [Column("weightage")]
        [MaxLength(50)]
        public string Weightage { get; set; } = null!;

        // KPI name or description (max 50 characters)
        [Column("kpi")]
        [MaxLength(50)]
        public string Kpi { get; set; } = null!;

        // Month for which this KPI applies (optional)
        [Column("month")]
        public byte? Month { get; set; }

        // Year for which this KPI applies (optional)
        [Column("year")]
        public short? Year { get; set; }

        // Timestamp when the record was created (optional)
        [Column("createdAt")]
        public string? CreatedAt { get; set; }

        // Timestamp when the record was last updated (optional)
        [Column("updatedAt")]
        public string? UpdatedAt { get; set; }

        // Version or status field
        [Column("v")]
        public byte V { get; set; }
    }
}
