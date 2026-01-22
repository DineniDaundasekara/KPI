using System.ComponentModel.DataAnnotations.Schema;
using System.Text.Json.Serialization;

namespace backend.Models
{
    [Table("Form7KpiNode", Schema = "dbo")]
    public class Form7KpiNode
    {
        [Column("KpiId")]
        public Guid KpiId { get; set; }

        [Column("NodeCode")]
        public string NodeCode { get; set; } = string.Empty;  // nvarchar(50)

        [Column("UnavailableMinutes")]
        public int? UnavailableMinutes { get; set; }

        [Column("TotalMinutes")]
        public long? TotalMinutes { get; set; }               // BIGINT

        [Column("TotalNodes")]
        public int? TotalNodes { get; set; }

        // ✅ prevents cycle in swagger/json
        [JsonIgnore]
        public Form7Kpi? Kpi { get; set; }
    }
}
