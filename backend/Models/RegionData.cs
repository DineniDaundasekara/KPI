using System;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace backend.Models
{
    [Table("regiontables")] // 👈 CHANGE this to your real table name (example: RegionData or Regions)
    public class RegionData
    {
        [Key]
        [Column("id")]
        public string Id { get; set; } = string.Empty;

        [Column("region")]
        public string Region { get; set; } = string.Empty;

        [Column("province")]
        public string Province { get; set; } = string.Empty;

        [Column("networkEngineer")]
        public string NetworkEngineer { get; set; } = string.Empty;

        [Column("lea")]
        public string Lea { get; set; } = string.Empty;

        [Column("createdAt")]
        public DateTime CreatedAt { get; set; }

        [Column("updatedAt")]
        public DateTime UpdatedAt { get; set; }

        // If your DB has column name "v" (from your earlier screenshot):
        [Column("v")]
        public int __v { get; set; }
    }
}
