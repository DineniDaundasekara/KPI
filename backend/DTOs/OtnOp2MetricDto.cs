namespace backend.DTOs
{
    public class OtnOp2MetricDto
    {
        public int Id { get; set; }
        public int OtnOp2Id { get; set; }

        public string Site { get; set; } = string.Empty;

        public int TotalFailedLinks { get; set; }
        public int LinksSlaNotViolated { get; set; }

        public short Year { get; set; }
        public byte Month { get; set; }
    }
}
