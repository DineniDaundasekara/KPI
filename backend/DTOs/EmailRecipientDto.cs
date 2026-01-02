using System.ComponentModel.DataAnnotations;

namespace backend.DTOs
{
    public class EmailRecipientDto
    {
        [Required]
        [EmailAddress]
        public string Email { get; set; } = string.Empty;
    }
}
