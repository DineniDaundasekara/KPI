using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;
using System.Text.Json.Serialization;

namespace backend.Models
{
    [Table("BbAnwKpi", Schema = "dbo")]
    public class BbAnwKpi
    {
        [Key]
        [Column("id")]
        public int Id { get; set; }   // ✅ INT identity in DB

        [Column("network_engineer_kpi")]
        public string NetworkEngineerKpi { get; set; } = string.Empty;

        [Column("division")]
        public string? Division { get; set; }

        [Column("section")]
        public string? Section { get; set; }

        [Column("kpi_percent")]
        public decimal? KpiPercent { get; set; }   // ✅ DECIMAL -> C# decimal

        public List<BbAnwKpiNode> Nodes { get; set; } = new();
    }
}
