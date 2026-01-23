using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace backend.Models
{
    [Table("BbAnwKpi", Schema = "dbo")]
    public class BbAnwKpi
    {
        [Key]
        [Column("KpiId")]
        public Guid KpiId { get; set; } = Guid.NewGuid();

        [Column("MongoObjectId")]
        public string? MongoObjectId { get; set; }

        [Column("No")]
        public int No { get; set; }

        [Column("NetworkEngineerKpi")]
        public string NetworkEngineerKpi { get; set; } = string.Empty;

        [Column("Division")]
        public string? Division { get; set; }

        [Column("Section")]
        public string? Section { get; set; }

        [Column("KpiPercent")]
        public decimal? KpiPercent { get; set; }

        public List<BbAnwKpiNode> Nodes { get; set; } = new();
    }
}
