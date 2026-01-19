namespace backend.Dtos
{
    public class TowerKpiReadDto
    {
        public byte No { get; set; }
        public string Responsibility { get; set; } = string.Empty;
        public string Frequency { get; set; } = string.Empty;
        public string Weightage { get; set; } = string.Empty;
        public string Kpi { get; set; } = string.Empty;
    }
}

