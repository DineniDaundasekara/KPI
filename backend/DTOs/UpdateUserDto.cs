namespace backend.DTOs
{
    public class UpdateUserDto
    {
        public string? ServiceId { get; set; }
        public string? Name { get; set; }
        public string? Role { get; set; }
        public bool? IsActive { get; set; }
        public List<string>? Pages { get; set; }
    }
}