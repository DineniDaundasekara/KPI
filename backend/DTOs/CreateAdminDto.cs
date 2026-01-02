namespace backend.DTOs
{
    public class CreateAdminDto
    {
        public string Name { get; set; } = "";
        public string ServiceNumber { get; set; } = ""; // your Angular sends 6 digit string
        public string Role { get; set; } = "admin";
        public List<string>? Pages { get; set; } // optional (like old Mongo "pages")
    }
}
