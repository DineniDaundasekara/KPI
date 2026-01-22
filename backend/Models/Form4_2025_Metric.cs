namespace backend.Models
{
    public class Form4_2025_Metric
    {
        public long Id { get; set; }

        public string Form4Id { get; set; } = null!;
        public string AreaCode { get; set; } = string.Empty;

        public decimal? KpiValue { get; set; }

        public byte Month { get; set; }
        public short Year { get; set; }

        public Form4_2025 Form4 { get; set; } = null!;
    }
}
