namespace backend.Models
{
    public class UserPage
    {
        public int Id { get; set; }
        public string PageName { get; set; } = "";
        public int UserId { get; set; }
        public User? User { get; set; }
    }
}
