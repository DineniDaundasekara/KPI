﻿namespace backend.Models
{
    public class MtncRoutine
    {
        public int Id { get; set; }  // id (int identity)
        public byte No { get; set; }                        // ✅ tinyint -> byte
        public string Kpi { get; set; } = string.Empty;
        public string Target { get; set; } = string.Empty;
        public string Calculation { get; set; } = string.Empty;
        public string Platform { get; set; } = string.Empty;
        public string ResponsibleDGM { get; set; } = string.Empty;
        public string DefinedOLADetails { get; set; } = string.Empty;
        public string DataSources { get; set; } = string.Empty;

        public string? CreatedAt { get; set; }              // your table looks like datetime/text; keep string if stored as text
        public string? UpdatedAt { get; set; }

        public byte V { get; set; }                         // ✅ tinyint -> byte
    }
}
