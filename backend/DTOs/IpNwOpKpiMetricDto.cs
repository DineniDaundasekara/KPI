namespace backend.DTOs
{
    public class IpNwOpKpiMetricDto
    {
        public int Id { get; set; }              // ✅ was long, now int (IDENTITY)
        public int IpNwOpKpiId { get; set; }     // ✅ FK int

        public string AreaCode { get; set; } = string.Empty;

        public int? UnavailableMinutes { get; set; }
        public int? TotalMinutes { get; set; }
        public int? TotalNodes { get; set; }

        public byte Month { get; set; }          // ✅ required
        public short Year { get; set; }          // ✅ required
    }
}
