namespace backend.DTOs
{
    public class KpiDefinitionDto
    {
        public string Id { get; set; } = "";
        public int RowNumber { get; set; }
        public string Perspectives { get; set; } = "";
        public string StrategicObjectives { get; set; } = "";
        public string KeyPerformanceIndicators { get; set; } = "";
        public string Unit { get; set; } = "";
        public string DescriptionOfKPI { get; set; } = "";

        // ✅ Auto-calculated
        public decimal Weightage { get; set; }

        // ✅ User input
        public int PointsApplicable { get; set; }

        public string? CreatedAt { get; set; }
        public string? UpdatedAt { get; set; }
        public int V { get; set; }
        public int Month { get; set; }
        public int Year { get; set; }
    }
}
