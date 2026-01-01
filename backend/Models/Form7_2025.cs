using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace backend.Models
{
    [Table("form7_2025")]
    public class Form7_2025
    {
        [Key]
        public int Id { get; set; }

        [Required]
        public int No { get; set; }

        [Required, MaxLength(200)]
        public string NetworkEngineerKpi { get; set; } = string.Empty;

        [Required, MaxLength(100)]
        public string Division { get; set; } = string.Empty;

        [Required, MaxLength(100)]
        public string Section { get; set; } = string.Empty;

        [Required]
        public decimal KpiPercent { get; set; }
    }
}
