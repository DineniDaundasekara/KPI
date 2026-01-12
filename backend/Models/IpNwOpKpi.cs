namespace backend.Models
{
    public class IpNwOpKpi
    {
        public string Id { get; set; } = null!;

        // 🔧 FIX: smallint / tinyint in DB → short in C#
        public short No { get; set; }

        public string NetworkEngineerKpi { get; set; } = string.Empty;
        public string Division { get; set; } = string.Empty;
        public string Section { get; set; } = string.Empty;

        public double KpiPercent { get; set; }
    }
}
