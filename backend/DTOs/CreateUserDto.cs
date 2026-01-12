namespace backend.DTOs
{
    public class CreateUserDto
    {
        public short? username { get; set; }
        public string name { get; set; } = "";
        public string role { get; set; } = "";
        public string isActive { get; set; } = "";
        public List<string>? pages { get; set; }
    }
}
