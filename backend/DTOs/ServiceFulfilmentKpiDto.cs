namespace backend.DTOs
{
    public class ServiceFulfilmentKpiDto
    {
        public string No { get; set; } = "";
        public string Kpi { get; set; } = "";
        public string Target { get; set; } = "";
        public string Calculation { get; set; } = "";
        public string Platform { get; set; } = "";
        public string ResponsibleDgm { get; set; } = "";

        // match backend property DefinedOlaDetails
        public string DefinedOlaDetails { get; set; } = "";

        public int Weightage { get; set; }
        public string DataSources { get; set; } = "";

        public int? Year { get; set; }
        public int? Month { get; set; }
    }
}
