namespace backend.Models
{
    public class IpNwOpKpi
    {
        public string Id { get; set; } = null!;

        // DB: int
        public int No { get; set; }

        public string NetworkEngineerKpi { get; set; } = string.Empty;
        public string Division { get; set; } = string.Empty;
        public string Section { get; set; } = string.Empty;

        // DB: float
        public double KpiPercent { get; set; }

        // DB: tinyint
        public byte? Month { get; set; }

        // DB: smallint
        public short? Year { get; set; }

        public DateTime? UpdatedAt { get; set; }

        public ICollection<Form6KpiMetric> Metrics { get; set; } = new List<Form6KpiMetric>();
    }
}
