using System;
using System.Collections.Generic;

namespace backend.DTOs
{
    public class BbAnwDto
    {
        public Guid? KpiId { get; set; }
        public string? MongoObjectId { get; set; }

        public int No { get; set; }
        public string NetworkEngineerKpi { get; set; } = string.Empty;
        public string? Division { get; set; }
        public string? Section { get; set; }

        public decimal? KpiPercent { get; set; }  // DECIMAL(6,2)

        public List<BbAnwNodeDto> Nodes { get; set; } = new();
    }
}
