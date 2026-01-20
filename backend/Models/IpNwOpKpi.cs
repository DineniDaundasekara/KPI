namespace backend.Models
{
    public class IpNwOpKpi
    {
        public string Id { get; set; } = null!;

        // ✅ DB is int -> use int (NOT short)
        public int No { get; set; }

        public string NetworkEngineerKpi { get; set; } = string.Empty;
        public string Division { get; set; } = string.Empty;
        public string Section { get; set; } = string.Empty;

        public double KpiPercent { get; set; }

        // ✅ One KPI -> Many Metrics
        public ICollection<Form6KpiMetric> Metrics { get; set; } = new List<Form6KpiMetric>();
    }
}
