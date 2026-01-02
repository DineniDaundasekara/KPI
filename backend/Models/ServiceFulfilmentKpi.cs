using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace backend.Models
{
    [Table("form4_2025")]
    public class ServiceFulfilmentKpi
    {
        [Key]
        [Column("id")]
        public int Id { get; set; }

        [Column("no")]
        public string? No { get; set; }

        [Column("kpi")]
        public string? Kpi { get; set; }

        [Column("target")]
        public string? Target { get; set; }

        [Column("calculation")]
        public string? Calculation { get; set; }

        [Column("platform")]
        public string? Platform { get; set; }

        [Column("responsibledgm")]
        public string? ResponsibleDgm { get; set; }

        // DB column is definedoladetails
        [Column("definedoladetails")]
        public string? DefinedOlaDetails { get; set; }

        [Column("weightage")]
        public int Weightage { get; set; }

        [Column("datasources")]
        public string? DataSources { get; set; }

        // ---------- Region numeric columns ----------
        public decimal? CENHKMD { get; set; }
        public decimal? CENHKMD1 { get; set; }
        public decimal? GQKINTB { get; set; }
        public decimal? NDRM { get; set; }
        public decimal? AWHO { get; set; }
        public decimal? KONKX { get; set; }
        public decimal? NGWT { get; set; }
        public decimal? KGKLY { get; set; }
        public decimal? CWPX { get; set; }
        public decimal? DBKYMT { get; set; }
        public decimal? GPHTNW { get; set; }
        public decimal? ADPR { get; set; }
        public decimal? BDBWMRG { get; set; }
        public decimal? KERN { get; set; }
        public decimal? EBMHMBH { get; set; }
        public decimal? AGGL { get; set; }
        public decimal? HRKTPH { get; set; }
        public decimal? BCAPKLTC { get; set; }
        public decimal? JA { get; set; }
        public decimal? KOMLTMBVA { get; set; }

        [Column("v")]
        public decimal? V { get; set; }

        // ---------- Areas columns ----------
        public string? areas_CENHKMD { get; set; }
        public string? areas_CENHKMD1 { get; set; }
        public string? areas_GQKINTB { get; set; }
        public string? areas_NDRM { get; set; }
        public string? areas_AWHO { get; set; }
        public string? areas_KONKX { get; set; }
        public string? areas_NGWT { get; set; }
        public string? areas_KGKLY { get; set; }
        public string? areas_CWPX { get; set; }
        public string? areas_DBKYMT { get; set; }
        public string? areas_GPHTNW { get; set; }
        public string? areas_ADPR { get; set; }
        public string? areas_BDBWMRG { get; set; }
        public string? areas_KERN { get; set; }
        public string? areas_EBMHMBH { get; set; }
        public string? areas_AGGL { get; set; }
        public string? areas_HRKTPH { get; set; }
        public string? areas_BCAPKLTC { get; set; }
        public string? areas_JA { get; set; }
        public string? areas_KOMLTMBVA { get; set; }
        public string? areas_GQ_KI_NTB { get; set; }
        public string? areas_CW_PX { get; set; }
        public string? areas_NG_WT { get; set; }
        public string? areas_HR_KT_PH { get; set; }
        public string? areas_KON_KX { get; set; }

        // ---------- meta ----------
        [Column("updatedAt")]
        public DateTime? UpdatedAt { get; set; }

        [Column("year")]
        public int? Year { get; set; }

        [Column("month")]
        public int? Month { get; set; }
    }
}
