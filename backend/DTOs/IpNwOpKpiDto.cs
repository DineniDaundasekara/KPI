using System;
using System.Collections.Generic;
using System.Text.Json.Serialization;

namespace backend.DTOs
{
    public class IpNwOpKpiDto
    {
        [JsonPropertyName("id")]
        public int Id { get; set; }   // ✅ was string (_id), now int

        [JsonPropertyName("network_engineer_kpi")]
        public string? NetworkEngineerKpi { get; set; }

        [JsonPropertyName("division")]
        public string? Division { get; set; }

        [JsonPropertyName("section")]
        public string? Section { get; set; }

        [JsonPropertyName("kpi_percent")]
        public double? KpiPercent { get; set; }

        [JsonPropertyName("updated_at")]
        public DateTime? UpdatedAt { get; set; }

        // ✅ Optional: keep these if your frontend expects area-wise mapping
        [JsonPropertyName("unavailable_minutes")]
        public Dictionary<string, int?> UnavailableMinutes { get; set; } = new();

        [JsonPropertyName("total_minutes")]
        public Dictionary<string, int?> TotalMinutes { get; set; } = new();

        [JsonPropertyName("total_nodes")]
        public Dictionary<string, int?> TotalNodes { get; set; } = new();
    }
}