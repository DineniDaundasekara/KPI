using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace backend.Models
{
    [Table("form7_2025")]
    public class Form7_2025
    {
        [Key]
        [Column("id")]
        public string Id { get; set; } = Guid.NewGuid().ToString();

        [Column("no")]
        public byte No { get; set; }

        [Column("network_engineer_kpi")]
        public string NetworkEngineerKpi { get; set; } = string.Empty;

        [Column("division")]
        public string Division { get; set; } = string.Empty;

        [Column("section")]
        public string Section { get; set; } = string.Empty;

        [Column("kpi_percent")]
        public double KpiPercent { get; set; }
    }
}
