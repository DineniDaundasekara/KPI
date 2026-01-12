namespace backend.DTOs
{
    public class Form7Dto
    {
        public int No { get; set; }
        public string NetworkEngineerKpi { get; set; } = string.Empty;
        public string Division { get; set; } = string.Empty;
        public string Section { get; set; } = string.Empty;
        public double KpiPercent { get; set; }

        // 🔴 REQUIRED FIELDS
        public int UnavailableMinutes { get; set; }
        public int TotalMinutes { get; set; }
        public int TotalNodes { get; set; }

        public int Month { get; set; }
        public int Year { get; set; }
    }
}
