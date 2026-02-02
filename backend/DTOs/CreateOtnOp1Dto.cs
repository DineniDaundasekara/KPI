namespace backend.DTOs
{
    public class CreateOtnOp1Dto
    {
        public string NetworkEngineerKpi { get; set; } = string.Empty;
        public string? Division { get; set; }
        public string? Section { get; set; }
        public decimal? KpiPercent { get; set; }
    }
}
