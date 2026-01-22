namespace backend.DTOs
{
    public class UpsertServiceFulfilmentMetricDto
    {
        public string ServiceFulfilmentKpiId { get; set; } = string.Empty;
        public string AreaCode { get; set; } = string.Empty;
        public decimal? KpiValue { get; set; }
        public byte Month { get; set; }
        public short Year { get; set; }
    }
}
