using System.ComponentModel.DataAnnotations;

namespace backend.DTOs
{
    public class CreateUserDto
    {
        [Required]
        public string ServiceId { get; set; } = string.Empty;
        
        [Required]
        public string Name { get; set; } = string.Empty;
        
        [Required]
        public string Role { get; set; } = string.Empty; // RoleName
        
        public bool IsActive { get; set; } = true;
        
        public List<string>? Pages { get; set; } // List of PageIds (as strings or ints? Logic in controller will handle) or PageNames
    }
}
