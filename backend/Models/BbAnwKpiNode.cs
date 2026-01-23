using System.ComponentModel.DataAnnotations.Schema;
using System.Text.Json.Serialization;

namespace backend.Models
{
    [Table("BbAnwKpiNode", Schema = "dbo")]
    public class BbAnwKpiNode
    {
        [Column("KpiId")]
        public Guid KpiId { get; set; }

        [Column("NodeCode")]
        public string NodeCode { get; set; } = string.Empty;

        [Column("UnavailableMinutes")]
        public int? UnavailableMinutes { get; set; }

        [Column("TotalMinutes")]
        public long? TotalMinutes { get; set; }

        [Column("TotalNodes")]
        public int? TotalNodes { get; set; }

        [JsonIgnore]
        public BbAnwKpi? Kpi { get; set; }
    }
}
