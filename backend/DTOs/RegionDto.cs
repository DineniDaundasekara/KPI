namespace backend.DTOs
{
    public class RegionDto
    {
        public string Id { get; set; } = string.Empty;
        public string Region { get; set; } = string.Empty;
        public string Province { get; set; } = string.Empty;
        public string NetworkEngineer { get; set; } = string.Empty;
        public string Lea { get; set; } = string.Empty;
        public DateTime CreatedAt { get; set; }
        public DateTime UpdatedAt { get; set; }
    }

    public class CreateRegionDto
    {
        public string Region { get; set; } = string.Empty;
        public string Province { get; set; } = string.Empty;
        public string NetworkEngineer { get; set; } = string.Empty;
        public string Lea { get; set; } = string.Empty;
    }

    public class UpdateRegionDto
    {
        public string Region { get; set; } = string.Empty;
        public string Province { get; set; } = string.Empty;
        public string NetworkEngineer { get; set; } = string.Empty;
        public string Lea { get; set; } = string.Empty;
    }
}
