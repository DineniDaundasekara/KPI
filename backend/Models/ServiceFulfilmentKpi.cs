using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace backend.Models
{
    [Table("ServiceFulfilmentKpi")]
    public class ServiceFulfilmentKpi
    {
        [Key]
        public int Id { get; set; }   // ✅ INT IDENTITY in SQL

        public string Kpi { get; set; } = string.Empty;

        public string Target { get; set; } = string.Empty;

        public string Calculation { get; set; } = string.Empty;

        public string Platform { get; set; } = string.Empty;

        public string ResponsibleDgm { get; set; } = string.Empty;

        public string DefineDoladetails { get; set; } = string.Empty;

        public int Weightage { get; set; }

        public string DataSources { get; set; } = string.Empty;

        public byte Month { get; set; }

        public short Year { get; set; }

        public string UpdatedAt { get; set; } = string.Empty;

        // 🔗 Navigation
        public ICollection<ServiceFulfilmentKpiMetric> Metrics { get; set; }
            = new List<ServiceFulfilmentKpiMetric>();
    }
}
