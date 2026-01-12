﻿using System.ComponentModel.DataAnnotations;

namespace backend.DTOs
{
    public class MtncRoutineDto
    {
        [Required]
        public byte No { get; set; } // ✅ tinyint

        [Required]
        public string Kpi { get; set; } = string.Empty;

        [Required]
        public string Target { get; set; } = string.Empty;

        [Required]
        public string Calculation { get; set; } = string.Empty;

        [Required]
        public string Platform { get; set; } = string.Empty;

        [Required]
        public string ResponsibleDGM { get; set; } = string.Empty;

        [Required]
        public string DefinedOLADetails { get; set; } = string.Empty;

        [Required]
        public string DataSources { get; set; } = string.Empty;
    }
}
