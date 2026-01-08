namespace backend.DTOs
{
    public class Form9Dto
    {
        public string? Id { get; set; }

        public byte No { get; set; }

        public string Network_Engineer_Kpi { get; set; } = string.Empty;

        public string Division { get; set; } = string.Empty;

        public string Section { get; set; } = string.Empty;

        // Must be double (SQL FLOAT)
        public double Kpi_Percent { get; set; }

        public byte Month { get; set; }

        public short Year { get; set; }

        public double? v { get; set; }
    }
}
