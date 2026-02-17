using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace backend.Models
{
    [Table("Page")]
    public class Page
    {
        [Key]
        public byte PageId { get; set; } // tinyint in DB

        [Required]
        [MaxLength(50)]
        public string PageCode { get; set; } = string.Empty;

        [Required]
        [MaxLength(100)]
        public string PageName { get; set; } = string.Empty;

        public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
    }
}
