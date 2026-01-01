using System.ComponentModel.DataAnnotations;

namespace backend.DTOs
{
    public class Form9Dto
    {
        public string? Id { get; set; }

        [Required]
        public byte No { get; set; }

        [Required]
        [MaxLength(100)]
        public string Network_Engineer_Kpi { get; set; } = string.Empty;

        [Required]
        [MaxLength(50)]
        public string Division { get; set; } = string.Empty;

        [Required]
        [MaxLength(50)]
        public string Section { get; set; } = string.Empty;

        [Required]
        [Range(0, 100)]
        public float Kpi_Percent { get; set; }

        /* ===== Failed Links ===== */

        public byte Total_Failed_Links_cenhkmd { get; set; }
        public byte Total_Failed_Links_cenhkmd1 { get; set; }
        public byte Total_Failed_Links_gqkintb { get; set; }
        public byte Total_Failed_Links_ndfrm { get; set; }
        public byte Total_Failed_Links_awho { get; set; }
        public byte Total_Failed_Links_konix { get; set; }

        /* ===== SLA Not Violated ===== */

        public byte Links_SLA_Not_Violated_cenhkmd { get; set; }
        public byte Links_SLA_Not_Violated_cenhkmd1 { get; set; }
        public byte Links_SLA_Not_Violated_gqkintb { get; set; }
        public byte Links_SLA_Not_Violated_ndfrm { get; set; }
        public byte Links_SLA_Not_Violated_awho { get; set; }
        public byte Links_SLA_Not_Violated_konix { get; set; }

        /* ===== Metadata ===== */

        public byte Month { get; set; }
        public short Year { get; set; }
    }
}
