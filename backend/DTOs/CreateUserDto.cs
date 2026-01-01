namespace backend.DTOs
{
    public class CreateUserDto
    {
        public short username { get; set; } // Keep as non-nullable for creation
        public string name { get; set; } = "";
        public string role { get; set; } = "";
        public string isActive { get; set; } = "true";
        public List<string> pages { get; set; } = new();
    }
}