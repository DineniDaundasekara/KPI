using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace backend.Models
{
    [Table("OtnOp1Metrics")]
    public class OtnOp1Metrics
    {
        [Key]
        public int Id { get; set; } // INT IDENTITY

        [Required]
        public int OtnOp1Id { get; set; }

        [Required]
        public string Site { get; set; } = null!;  // VARCHAR(20)

        public int UnavailableMinutes { get; set; }
        public int TotalMinutes { get; set; }
        public int TotalNodes { get; set; }

        public short Year { get; set; }
        public byte Month { get; set; }

        // Navigation
        [ForeignKey(nameof(OtnOp1Id))]
        public OtnOp1? OtnOp1 { get; set; }
    }
}
