using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;
using System.Text.Json.Serialization;

namespace backend.Models
{
    [Table("BbAnwKpiNode", Schema = "dbo")]
    public class BbAnwKpiNode
    {
        [Key]
        [Column("id")]
        public int Id { get; set; }  // ✅ INT identity

        [Column("bb_anw_kpi_id")]
        public int BbAnwKpiId { get; set; }  // ✅ FK int

        [Column("node_code")]
        public string NodeCode { get; set; } = string.Empty;

        [Column("unavailable_minutes")]
        public int? UnavailableMinutes { get; set; }

        [Column("total_minutes")]
        public long? TotalMinutes { get; set; } // bigint -> long

        [Column("total_nodes")]
        public int? TotalNodes { get; set; }

        [Column("month")]
        public byte Month { get; set; } // tinyint -> byte

        [Column("year")]
        public short Year { get; set; } // smallint -> short

        [JsonIgnore]
        public BbAnwKpi? Kpi { get; set; }
    }
}
