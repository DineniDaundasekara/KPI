namespace backend.DTOs
{
    public class OtnOp1MetricDto
    {
        public int Id { get; set; }          // Metrics table identity (optional in responses)
        public int OtnOp1Id { get; set; }    // FK

        public string Site { get; set; } = string.Empty;

        public int UnavailableMinutes { get; set; }
        public int TotalMinutes { get; set; }
        public int TotalNodes { get; set; }

        public short Year { get; set; }
        public byte Month { get; set; }
    }
}
