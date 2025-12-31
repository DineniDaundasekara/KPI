using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace backend.Models
{
    [Table("rtom_area_lookup")]
    public class RtomArea
    {
        [Key]
        [Column("area_code")]
        public string AreaCode { get; set; }

        [Column("display_name")]
        public string DisplayName { get; set; }
    }
}