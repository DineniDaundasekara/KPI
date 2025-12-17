namespace backend.Models
{
    public class ServiceFulfilmentKpi
    {
        public int Id { get; set; }
        public string No { get; set; }
        public string Kpi { get; set; }
        public string Target { get; set; }
        public string Calculation { get; set; }
        public string Platform { get; set; }
        public string ResponsibleDgm { get; set; }
        public string DefinedOla { get; set; }
        public int Weightage { get; set; }
        public string DataSources { get; set; }
    }
}
