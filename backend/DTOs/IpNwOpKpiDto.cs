using System;
using System.Collections.Generic;
using System.Text.Json.Serialization;

namespace backend.DTOs
{
    public class IpNwOpKpiDto
    {
        [JsonPropertyName("_id")]
        public string Id { get; set; } = string.Empty;

        [JsonPropertyName("no")]
        public int? No { get; set; }

        [JsonPropertyName("network_engineer_kpi")]
        public string? NetworkEngineerKpi { get; set; }

        [JsonPropertyName("division")]
        public string? Division { get; set; }

        [JsonPropertyName("section")]
        public string? Section { get; set; }

        [JsonPropertyName("kpi_percent")]
        public double? KpiPercent { get; set; }

        [JsonPropertyName("month")]
        public byte? Month { get; set; }

        [JsonPropertyName("year")]
        public short? Year { get; set; }

        [JsonPropertyName("updated_at")]
        public DateTime? UpdatedAt { get; set; }

        [JsonPropertyName("unavailable_minutes")]
        public Dictionary<string, int?> UnavailableMinutes { get; set; } = new();

        [JsonPropertyName("total_minutes")]
        public Dictionary<string, int?> TotalMinutes { get; set; } = new();

        [JsonPropertyName("total_nodes")]
        public Dictionary<string, int?> TotalNodes { get; set; } = new();
    }
}
