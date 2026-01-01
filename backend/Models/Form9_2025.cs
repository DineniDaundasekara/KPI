using System;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace backend.Models
{
    [Table("form9_2025")]
    public class Form9_2025
    {
        [Key]
        [Column("id")]
        public string Id { get; set; } = Guid.NewGuid().ToString();

        [Column("no")]
        public byte No { get; set; }

        [Column("network_engineer_kpi")]
        public string Network_Engineer_Kpi { get; set; } = string.Empty;

        [Column("division")]
        public string Division { get; set; } = string.Empty;

        [Column("section")]
        public string Section { get; set; } = string.Empty;

        [Column("kpi_percent")]
        public double Kpi_Percent { get; set; }

        // REQUIRED IDs
        [Column("Total_Failed_Links_id")]
        public string Total_Failed_Links_id { get; set; } = string.Empty;

        [Column("Links_SLA_Not_Violated_id")]
        public string Links_SLA_Not_Violated_id { get; set; } = string.Empty;

        // Total Failed Links
        public byte Total_Failed_Links_cenhkmd { get; set; }
        public byte Total_Failed_Links_cenhkmd1 { get; set; }
        public byte Total_Failed_Links_gqkintb { get; set; }
        public byte Total_Failed_Links_ndfrm { get; set; }
        public byte Total_Failed_Links_awho { get; set; }
        public byte Total_Failed_Links_konix { get; set; }
        public byte Total_Failed_Links_ngivt { get; set; }
        public byte Total_Failed_Links_kgkly { get; set; }
        public byte Total_Failed_Links_cwpx { get; set; }
        public byte Total_Failed_Links_debkymt { get; set; }
        public byte Total_Failed_Links_gphtnw { get; set; }
        public byte Total_Failed_Links_adipr { get; set; }
        public byte Total_Failed_Links_bddwmrg { get; set; }
        public byte Total_Failed_Links_keirn { get; set; }
        public byte Total_Failed_Links_embmbmh { get; set; }
        public byte Total_Failed_Links_aggl { get; set; }
        public byte Total_Failed_Links_hrktph { get; set; }
        public byte Total_Failed_Links_bcjrdkltc { get; set; }
        public byte Total_Failed_Links_ja { get; set; }
        public byte Total_Failed_Links_komltmbva { get; set; }

        // SLA Not Violated
        public byte Links_SLA_Not_Violated_cenhkmd { get; set; }
        public byte Links_SLA_Not_Violated_cenhkmd1 { get; set; }
        public byte Links_SLA_Not_Violated_gqkintb { get; set; }
        public byte Links_SLA_Not_Violated_ndfrm { get; set; }
        public byte Links_SLA_Not_Violated_awho { get; set; }
        public byte Links_SLA_Not_Violated_konix { get; set; }
        public byte Links_SLA_Not_Violated_ngivt { get; set; }
        public byte Links_SLA_Not_Violated_kgkly { get; set; }
        public byte Links_SLA_Not_Violated_cwpx { get; set; }
        public byte Links_SLA_Not_Violated_debkymt { get; set; }
        public byte Links_SLA_Not_Violated_gphtnw { get; set; }
        public byte Links_SLA_Not_Violated_adipr { get; set; }
        public byte Links_SLA_Not_Violated_bddwmrg { get; set; }
        public byte Links_SLA_Not_Violated_keirn { get; set; }
        public byte Links_SLA_Not_Violated_embmbmh { get; set; }
        public byte Links_SLA_Not_Violated_aggl { get; set; }
        public byte Links_SLA_Not_Violated_hrktph { get; set; }
        public byte Links_SLA_Not_Violated_bcjrdkltc { get; set; }
        public byte Links_SLA_Not_Violated_ja { get; set; }
        public byte Links_SLA_Not_Violated_komltmbva { get; set; }

        [Column("v")]
        public byte V { get; set; }

        [Column("month")]
        public byte Month { get; set; }

        [Column("year")]
        public short Year { get; set; }

        [Column("updatedAt")]
        public string UpdatedAt { get; set; } = DateTime.Now.ToString("yyyy-MM-dd HH:mm:ss");
    }
}
