using System.ComponentModel.DataAnnotations;

namespace backend.DTOs
{
    public class UpsertKpiDefinitionDto
    {
        [Range(1, 255)]
        public int RowNumber { get; set; }

        [Required] public string Perspectives { get; set; } = "";
        [Required] public string StrategicObjectives { get; set; } = "";
        [Required] public string KeyPerformanceIndicators { get; set; } = "";
        [Required] public string Unit { get; set; } = "";
        [Required] public string DescriptionOfKPI { get; set; } = "";

        [Range(0, 255)]
        public int Weightage { get; set; }

        [Range(1, 12)]
        public int? Month { get; set; }

        [Range(2000, 2100)]
        public int? Year { get; set; }
    }
}
