namespace backend.DTOs
{
    public class ServiceFulfilmentKpiDto
    {
        public string? Id { get; set; }   // ✅ add this

        public int No { get; set; }
        public string Kpi { get; set; } = string.Empty;
        public string Target { get; set; } = string.Empty;
        public string Calculation { get; set; } = string.Empty;
        public string Platform { get; set; } = string.Empty;
        public string ResponsibleDgm { get; set; } = string.Empty;
        public string DefineDoladetails { get; set; } = string.Empty;
        public int Weightage { get; set; }
        public string DataSources { get; set; } = string.Empty;

        public byte Month { get; set; }   // ✅ make it byte
        public short Year { get; set; }   // ✅ make it short
    }
}
