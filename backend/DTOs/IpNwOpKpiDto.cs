﻿namespace backend.DTOs
{
    public class IpNwOpKpiDto
    {
        public int no { get; set; }
        public string network_engineer_kpi { get; set; } = string.Empty;
        public string division { get; set; } = string.Empty;
        public string section { get; set; } = string.Empty;
        public double kpi_percent { get; set; }

        // Metric dictionaries: area_code -> value
        public Dictionary<string, int?>? unavailable_minutes { get; set; }
        public Dictionary<string, int?>? total_minutes { get; set; }
        public Dictionary<string, int?>? total_nodes { get; set; }
    }
}