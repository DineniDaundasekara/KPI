using System.ComponentModel.DataAnnotations.Schema;

namespace backend.Models
{
    [Table("UserPageAccess")]
    public class UserPageAccess
    {
        public int UserId { get; set; }
        [ForeignKey("UserId")]
        public User? User { get; set; }

        public byte PageId { get; set; }
        [ForeignKey("PageId")]
        public Page? Page { get; set; }
    }
}
