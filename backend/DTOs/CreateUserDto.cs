namespace backend.DTOs
{
    public class CreateUserDto
    {
        public string Username { get; set; } = "";
        public string Name { get; set; } = "";
        public string Role { get; set; } = "";
        public List<string> Pages { get; set; } = new();
    }
}
