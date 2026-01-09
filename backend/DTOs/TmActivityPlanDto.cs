// DTOs/TmActivityPlanDto.cs
using System;
using System.ComponentModel.DataAnnotations;

namespace backend.DTOs
{
    public class TmActivityPlanDto
    {
        public int Id { get; set; }
        public string No { get; set; }
        public string Kpi { get; set; }
        public string Target { get; set; }
        public string Calculation { get; set; }
        public string Platform { get; set; }
        public string ResponsibleDGM { get; set; }
        public string DefinedOLADetails { get; set; }
        public string DataSources { get; set; }
    }

    public class CreateTmActivityPlanDto
    {
        public string? No { get; set; }
        [Required]
        public string Kpi { get; set; }
        public string Target { get; set; }
        public string Calculation { get; set; }
        public string Platform { get; set; }
        public string ResponsibleDGM { get; set; }
        public string DefinedOLADetails { get; set; }
        public string DataSources { get; set; }
    }

    public class UpdateTmActivityPlanDto : CreateTmActivityPlanDto
    {
    }
}