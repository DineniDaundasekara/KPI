using System.ComponentModel.DataAnnotations;

namespace backend.DTOs
{
    public class UpsertKpiDefinitionDto
    {
        [Required] public string Perspectives { get; set; } = "";
        [Required] public string StrategicObjectives { get; set; } = "";
        [Required] public string KeyPerformanceIndicators { get; set; } = "";
        [Required] public string Unit { get; set; } = "";
        [Required] public string DescriptionOfKPI { get; set; } = "";

        [Range(0, 100000)]
        public int PointsApplicable { get; set; } = 0;

        [Range(1, 12)]
        public int? Month { get; set; }   // ✅ MUST be nullable

        [Range(2000, 2100)]
        public int? Year { get; set; }    // ✅ MUST be nullable
    }
}
