using System.Text.RegularExpressions;
using backend.Data;
using backend.DTOs;
using backend.Models;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace backend.Controllers
{
    [ApiController]
    [Route("api/users")]
    public class UsersController : ControllerBase
    {
        private readonly AppDbContext _db;

        public UsersController(AppDbContext db) => _db = db;

        [HttpGet("admins")]
        public async Task<ActionResult<List<AdminUserDto>>> GetAdmins()
        {
            var admins = await _db.Users
                .Where(u => u.Role == "admin" || u.Role == "padmin")
                .OrderByDescending(u => u.LastLogin)
                .ToListAsync();

            return Ok(admins.Select(ToAdminDto).ToList());
        }

        [HttpPost("admins")]
        public async Task<ActionResult<AdminUserDto>> CreateAdmin([FromBody] CreateAdminDto dto)
        {
            if (string.IsNullOrWhiteSpace(dto.Name))
                return BadRequest("Name is required.");

            var service = (dto.ServiceNumber ?? "").Trim();

            // ✅ must be exactly 6 digits
            if (!Regex.IsMatch(service, @"^\d{6}$"))
                return BadRequest("ServiceNumber must be exactly 6 digits (example: 010399).");

            var exists = await _db.Users.AnyAsync(u => u.Username == service);
            if (exists)
                return Conflict($"Service Number {service} already exists.");

            var nowIso = DateTime.UtcNow.ToString("o");

            var user = new User
            {
                Id = Guid.NewGuid().ToString("N"),
                Username = service,                 // ✅ store as string "010399"
                Name = dto.Name.Trim(),
                Role = string.IsNullOrWhiteSpace(dto.Role) ? "admin" : dto.Role.Trim(),
                IsActive = true,
                V = false,
                LastLogin = DateTime.UtcNow,
                CreatedAt = nowIso,
                UpdatedAt = nowIso
            };

            ApplyPages(user, dto.Pages);

            _db.Users.Add(user);
            await _db.SaveChangesAsync();

            return Ok(ToAdminDto(user));
        }

        [HttpPatch("{id}/status")]
        public async Task<IActionResult> ToggleStatus(string id)
        {
            var user = await _db.Users.FirstOrDefaultAsync(u => u.Id == id);
            if (user == null) return NotFound();

            user.IsActive = !user.IsActive;
            user.UpdatedAt = DateTime.UtcNow.ToString("o");

            await _db.SaveChangesAsync();
            return NoContent();
        }

        [HttpDelete("{id}")]
        public async Task<IActionResult> Delete(string id)
        {
            var user = await _db.Users.FirstOrDefaultAsync(u => u.Id == id);
            if (user == null) return NotFound();

            _db.Users.Remove(user);
            await _db.SaveChangesAsync();
            return NoContent();
        }

        private static AdminUserDto ToAdminDto(User u) => new AdminUserDto
        {
            Id = u.Id,
            Name = u.Name,
            Role = u.Role,
            IsActive = u.IsActive,
            LastLogin = u.LastLogin,
            CreatedAt = u.CreatedAt,
            ServiceNumber = u.Username,
            Pages = ExtractPages(u)
        };

        private static List<string> ExtractPages(User u)
        {
            var pages = new[] { u.Pages_0, u.Pages_1, u.Pages_2, u.Pages_3, u.Pages_4, u.Pages_5, u.Pages_6, u.Pages_7, u.Pages_8 };
            return pages.Where(p => !string.IsNullOrWhiteSpace(p)).Select(p => p!.Trim()).ToList();
        }

        private static void ApplyPages(User u, List<string>? pages)
        {
            var clean = (pages ?? new List<string>())
                .Where(p => !string.IsNullOrWhiteSpace(p))
                .Select(p => p.Trim())
                .Take(9)
                .ToList();

            u.Pages_0 = clean.ElementAtOrDefault(0);
            u.Pages_1 = clean.ElementAtOrDefault(1);
            u.Pages_2 = clean.ElementAtOrDefault(2);
            u.Pages_3 = clean.ElementAtOrDefault(3);
            u.Pages_4 = clean.ElementAtOrDefault(4);
            u.Pages_5 = clean.ElementAtOrDefault(5);
            u.Pages_6 = clean.ElementAtOrDefault(6);
            u.Pages_7 = clean.ElementAtOrDefault(7);
            u.Pages_8 = clean.ElementAtOrDefault(8);
        }
    }
}
