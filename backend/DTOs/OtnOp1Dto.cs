namespace backend.DTOs
{
    public class OtnOp1Dto
    {
        public int Id { get; set; }  // INT IDENTITY

        public string NetworkEngineerKpi { get; set; } = string.Empty;

        public string? Division { get; set; }

        public string? Section { get; set; }

        public decimal? KpiPercent { get; set; }  // DECIMAL(6,3) NULL
    }
}
