using System.Collections.Generic;

namespace backend.DTOs
{
    public class IpNwOpKpiDto
    {
        public string _id { get; set; } = string.Empty;
        public int no { get; set; }
        public string network_engineer_kpi { get; set; } = string.Empty;
        public string division { get; set; } = string.Empty;
        public string section { get; set; } = string.Empty;
        public double kpi_percent { get; set; }

        public Dictionary<string, int?> unavailable_minutes { get; set; } = new();
        public Dictionary<string, int?> total_minutes { get; set; } = new();
        public Dictionary<string, int?> total_nodes { get; set; } = new();
    }
}
