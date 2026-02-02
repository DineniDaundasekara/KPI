namespace backend.DTOs
{
    public class ServiceFulfilmentKpiDto
    {
        public int? Id { get; set; }   // ✅ int now (nullable for create)

        public string Kpi { get; set; } = string.Empty;
        public string Target { get; set; } = string.Empty;
        public string Calculation { get; set; } = string.Empty;
        public string Platform { get; set; } = string.Empty;
        public string ResponsibleDgm { get; set; } = string.Empty;
        public string DefineDoladetails { get; set; } = string.Empty;
        public int Weightage { get; set; }
        public string DataSources { get; set; } = string.Empty;

        public byte Month { get; set; }
        public short Year { get; set; }

        public string? UpdatedAt { get; set; } // ✅ optional (since DB has updatedAt)
    }
}
