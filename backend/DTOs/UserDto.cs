namespace backend.DTOs
{
    public class UserDto
    {
        public int Id { get; set; }
        public string Username { get; set; } = "";
        public string Name { get; set; } = "";
        public string Role { get; set; } = "";
        public List<string> Pages { get; set; } = new();
    }
}
