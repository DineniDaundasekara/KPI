using System.ComponentModel.DataAnnotations.Schema;

namespace backend.Models
{
    [Table("regiondata")]
    public class RegionData
    {
        [Column("id")]
        public int Id { get; set; }

        [Column("region")]
        public string Region { get; set; }

        [Column("province")]
        public string Province { get; set; }

        [Column("network_engineer")]
        public string NetworkEngineer { get; set; }

        [Column("lea_code")]
        public string LeaCode { get; set; }
    }
}