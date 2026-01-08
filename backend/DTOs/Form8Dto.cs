namespace backend.DTOs
{
    public class Form8Dto
    {
        public byte No { get; set; }

        public string Network_Engineer_Kpi { get; set; } = null!;

        public string Division { get; set; } = null!;

        public string Section { get; set; } = null!;

        // ✅ match model type
        public double Kpi_Percent { get; set; }

        // ✅ match model type
        public double? v { get; set; }
    }
}
