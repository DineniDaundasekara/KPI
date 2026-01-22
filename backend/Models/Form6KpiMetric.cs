namespace backend.Models
{
    public class Form6KpiMetric
    {
        public long Id { get; set; }

        public string Form6Id { get; set; } = null!;
        public string AreaCode { get; set; } = string.Empty;

        public int? UnavailableMinutes { get; set; }
        public int? TotalMinutes { get; set; }
        public int? TotalNodes { get; set; }

        // Navigation
        public IpNwOpKpi Form6 { get; set; } = null!;
    }
}