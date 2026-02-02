using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace backend.Models
{
    [Table("OtnOp2")]
    public class OtnOp2
    {
        [Key]
        public int Id { get; set; }   // INT IDENTITY

        [Required]
        public string NetworkEngineerKpi { get; set; } = null!;

        public string? Division { get; set; }
        public string? Section { get; set; }

        [Column(TypeName = "decimal(6,3)")]
        public decimal? KpiPercent { get; set; }

        public ICollection<OtnOp2Metrics> Metrics { get; set; } = new List<OtnOp2Metrics>();
    }
}
