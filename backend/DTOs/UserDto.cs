namespace backend.DTOs
{
    public class UserDto
    {
        public int UserId { get; set; }
        public string ServiceId { get; set; } = string.Empty;
        public string Name { get; set; } = string.Empty;
        public string Role { get; set; } = string.Empty; // RoleName
        public bool IsActive { get; set; }
        public List<string> Pages { get; set; } = new(); // PageNames or Codes
        public DateTime? LastLogin { get; set; }
        public DateTime CreatedAt { get; set; }
        public DateTime? UpdatedAt { get; set; }
    }
}