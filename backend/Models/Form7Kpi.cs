using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace backend.Models
{
    [Table("Form7Kpi", Schema = "dbo")]
    public class Form7Kpi
    {
        [Key]
        [Column("KpiId")]
        public Guid KpiId { get; set; } = Guid.NewGuid();

        [Column("MongoObjectId")]
        public string? MongoObjectId { get; set; }  // varchar(24)

        [Column("No")]
        public int No { get; set; }

        [Column("NetworkEngineerKpi")]
        public string NetworkEngineerKpi { get; set; } = string.Empty;

        [Column("Division")]
        public string? Division { get; set; }

        [Column("Section")]
        public string? Section { get; set; }

        // DECIMAL(6,2)
        [Column("KpiPercent")]
        public decimal? KpiPercent { get; set; }

        // Navigation
        public List<Form7KpiNode> Nodes { get; set; } = new();
    }
}
