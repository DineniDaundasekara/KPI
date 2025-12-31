namespace backend.Models
{
    public class EmailRecipient
    {
        public string Id { get; set; } = string.Empty;  // id (varchar/nvarchar)
        public string Email { get; set; } = string.Empty; // email
        public byte V { get; set; } // v (tinyint)
    }
}
