namespace backend.Models
{
    public class IpNwOpKpi
    {
        public string Id { get; set; } = null!;
        public int No { get; set; }

        public string NetworkEngineerKpi { get; set; } = string.Empty;
        public string Division { get; set; } = string.Empty;
        public string Section { get; set; } = string.Empty;

        public double KpiPercent { get; set; } // ✅ FLOAT in DB => double in C#
    }
}
