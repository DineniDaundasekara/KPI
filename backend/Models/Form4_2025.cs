using System;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace backend.Models
{
    [Table("form4_2025")]
    public class Form4_2025
    {
        [Key]
        public string Id { get; set; } = Guid.NewGuid().ToString();

        public int No { get; set; }

        public string Kpi { get; set; } = string.Empty;

        public string Target { get; set; } = string.Empty;

        public string Calculation { get; set; } = string.Empty;

        public string Platform { get; set; } = string.Empty;

        public string ResponsibleDgm { get; set; } = string.Empty;

        public string DefineDoladetails { get; set; } = string.Empty;

        public int Weightage { get; set; }

        public string DataSources { get; set; } = string.Empty;
        public byte Month { get; set; }   // tinyint
        public short Year { get; set; }   // smallint


        public string UpdatedAt { get; set; } = string.Empty;

        public int? V { get; set; }
    }
}
