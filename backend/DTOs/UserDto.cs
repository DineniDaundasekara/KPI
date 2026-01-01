namespace backend.DTOs
{
    public class UserDto
    {
        public string id { get; set; } = "";
        public short? username { get; set; } // CHANGED: short → short?
        public string name { get; set; } = "";
        public string role { get; set; } = "";
        public string isActive { get; set; } = "";
        public List<string> Pages { get; set; } = new();
        public string createdAt { get; set; } = "";
        public string updatedAt { get; set; } = "";
        public bool? v { get; set; } // CHANGED: bool → bool?
    }
}