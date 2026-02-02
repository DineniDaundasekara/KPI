using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace backend.Models
{
    [Table("OtnOp2Metrics")]
    public class OtnOp2Metrics
    {
        [Key]
        public int Id { get; set; }  // INT IDENTITY

        [Required]
        public int OtnOp2Id { get; set; }

        [Required]
        public string Site { get; set; } = null!;

        public int TotalFailedLinks { get; set; }
        public int LinksSlaNotViolated { get; set; }

        public short Year { get; set; }
        public byte Month { get; set; }

        [ForeignKey(nameof(OtnOp2Id))]
        public OtnOp2? OtnOp2 { get; set; }
    }
}
