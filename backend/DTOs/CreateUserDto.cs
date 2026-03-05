/*
 * File: CreateUserDto.cs
 * Data Transfer Object for creating new user accounts.
 */

using System.ComponentModel.DataAnnotations;

namespace backend.DTOs
{
    // =========================================================
    // CREATE USER DTO
    // Used for accepting user creation requests from frontend
    // =========================================================
    public class CreateUserDto
    {
        // Service ID of the user (required)
        [Required]
        public string ServiceId { get; set; } = string.Empty;
        
        // Full name of the user (required)
        [Required]
        public string Name { get; set; } = string.Empty;
        
        // Role name assigned to the user (required)
        [Required]
        public string Role { get; set; } = string.Empty;
        
        // Indicates whether the user account is active
        public bool IsActive { get; set; } = true;
        
        // List of pages or page IDs the user has access to (optional)
        public List<string>? Pages { get; set; }
    }
}
