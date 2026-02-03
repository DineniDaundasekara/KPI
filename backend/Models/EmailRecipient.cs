namespace backend.Models
{
    public class EmailRecipient
    {
        public int Id { get; set; }  // id (int identity)
        public string Email { get; set; } = string.Empty; // email (nvarchar(50))
        public byte V { get; set; } // v (tinyint)
    }
}
