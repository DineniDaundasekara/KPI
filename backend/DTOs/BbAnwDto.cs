using System.Collections.Generic;

namespace backend.DTOs
{
    public class BbAnwDto
    {
        public int Id { get; set; }
        public string NetworkEngineerKpi { get; set; } = string.Empty;
        public string? Division { get; set; }
        public string? Section { get; set; }
        public decimal? KpiPercent { get; set; }

        public List<BbAnwNodeDto> Nodes { get; set; } = new();
    }
}
