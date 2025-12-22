namespace backend.DTOs
{
    public class AdminUserDto
    {
        public string Id { get; set; } = "";
        public string Name { get; set; } = "";

        // frontend uses serviceNumber
        public string ServiceNumber { get; set; } = "";

        public string Role { get; set; } = "admin";
        public bool IsActive { get; set; } = true;

        public string? CreatedAt { get; set; }
        public DateTime? LastLogin { get; set; }

        public List<string> Pages { get; set; } = new();
    }
}
