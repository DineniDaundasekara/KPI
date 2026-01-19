using System.ComponentModel.DataAnnotations;

namespace backend.Dtos
{
    public class TowerKpiCreateDto
    {
        [Required] [Range(0, 255)] public int No { get; set; }

        [Required] public string Responsibility { get; set; } = null!;
        [Required] public string Frequency { get; set; } = null!;
        [Required] public string Weightage { get; set; } = null!;
        [Required] public string Kpi { get; set; } = null!;
        public int? Month { get; set; }
        public int? Year { get; set; }
    }
}
