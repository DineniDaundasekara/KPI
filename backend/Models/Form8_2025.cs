using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace backend.Models
{
    [Table("form8_2025")]
    public class Form8_2025
    {
        [Key]
        [Column("id")]
        public string Id { get; set; }
        public byte No { get; set; }
        public string Network_Engineer_Kpi { get; set; }
        public string Division { get; set; }
        public string Section { get; set; }
        public double Kpi_Percent { get; set; }

        // REQUIRED NOT NULL FIELDS
        public string Unavailable_Minutes_Id { get; set; }
        public string Total_Minutes_Id { get; set; }
        public string Total_Nodes_Id { get; set; }

        public byte Month { get; set; }
        public short Year { get; set; }
        public string UpdatedAt { get; set; }

        public float? v { get; set; }

    }
}
