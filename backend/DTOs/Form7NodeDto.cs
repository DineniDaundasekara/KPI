namespace backend.DTOs
{
    public class Form7NodeDto
    {
        public string NodeCode { get; set; } = string.Empty;
        public int? UnavailableMinutes { get; set; }
        public long? TotalMinutes { get; set; }
        public int? TotalNodes { get; set; }
    }
}
