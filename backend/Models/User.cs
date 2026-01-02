namespace backend.Models
{
    public class User
    {
        public string Id { get; set; } = "";          // nvarchar(50)
        public string Username { get; set; } = "";    // nvarchar(6)
        public string Name { get; set; } = "";
        public string Role { get; set; } = "admin";
        public bool IsActive { get; set; } = true;    // bit
        public bool V { get; set; } = false;          // bit
        public DateTime? LastLogin { get; set; }       // datetime2
        public string? CreatedAt { get; set; }         // nvarchar
        public string? UpdatedAt { get; set; }         // nvarchar

        public string? Pages_0 { get; set; }
        public string? Pages_1 { get; set; }
        public string? Pages_2 { get; set; }
        public string? Pages_3 { get; set; }
        public string? Pages_4 { get; set; }
        public string? Pages_5 { get; set; }
        public string? Pages_6 { get; set; }
        public string? Pages_7 { get; set; }
        public string? Pages_8 { get; set; }
    }
}
