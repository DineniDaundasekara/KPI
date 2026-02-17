using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace backend.Models
{
    [Table("PlatformKpiAssignment")]
    public class PlatformKpiAssignment
    {
        [Key]
        public int AssignmentId { get; set; }

        public int UserId { get; set; }
        [ForeignKey("UserId")]
        public User? User { get; set; }

        public byte PageId { get; set; }
        [ForeignKey("PageId")]
        public Page? Page { get; set; }

        public DateTime AssignedAt { get; set; } = DateTime.UtcNow;
    }
}
