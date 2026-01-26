namespace backend.DTOs
{
    public class IpNwOpKpiMetricDto
    {
        public long Id { get; set; }
        public string AreaCode { get; set; } = string.Empty;

        public int? UnavailableMinutes { get; set; }
        public int? TotalMinutes { get; set; }
        public int? TotalNodes { get; set; }
    }
}
