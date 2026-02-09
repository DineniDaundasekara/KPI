namespace backend.DTOs
{
    public class KpiDefinitionDto
    {
        public int Id { get; set; }

        public string Perspectives { get; set; } = "";
        public string StrategicObjectives { get; set; } = "";
        public string KeyPerformanceIndicators { get; set; } = "";
        public string Unit { get; set; } = "";
        public string DescriptionOfKPI { get; set; } = "";

        // from DB (decimal(10,4))
        public decimal Weightage { get; set; }

        // user input field (int, default 0)
        public int PointsApplicable { get; set; }

        public string? CreatedAt { get; set; }
        public string? UpdatedAt { get; set; }

        // tinyint + smallint in DB, but int is fine in DTO
        public int Month { get; set; }
        public int Year { get; set; }
    }
}
