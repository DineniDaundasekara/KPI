using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace backend.Models
{
    [Table("ServiceFulfilmentKpiMetrics")]
    public class ServiceFulfilmentKpiMetric
    {
        [Key]
        public long Id { get; set; }

        // FK column
        public string ServiceFulfilmentKpiId { get; set; } = null!;

        public string AreaCode { get; set; } = string.Empty;

        public decimal? KpiValue { get; set; }

        public byte Month { get; set; }

        public short Year { get; set; }

        // 🔗 Navigation
        [ForeignKey(nameof(ServiceFulfilmentKpiId))]
        public ServiceFulfilmentKpi ServiceFulfilmentKpi { get; set; } = null!;
    }
}
