namespace backend.Models
{
    public class UserPage
    {
        public int Id { get; set; }
        public string PageName { get; set; } = "";

        // FIX: users.id is nvarchar, so FK must be string
        public string UserId { get; set; } = "";
        public User? User { get; set; }
    }
}
