using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace backend.Models
{
    [Table("OtnOp1")]
    public class OtnOp1
    {
        [Key]
        public int Id { get; set; }   // INT IDENTITY

        [Required]
        public string NetworkEngineerKpi { get; set; } = null!;

        public string? Division { get; set; }
        public string? Section { get; set; }

        // DECIMAL(6,3)
        [Column(TypeName = "decimal(6,3)")]
        public decimal? KpiPercent { get; set; }

        // Navigation
        public ICollection<OtnOp1Metrics> Metrics { get; set; } = new List<OtnOp1Metrics>();
    }
}
