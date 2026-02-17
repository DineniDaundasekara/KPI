using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using backend.Data;
using backend.Models;
using backend.DTOs;
using Microsoft.AspNetCore.Authorization;

namespace backend.Controllers
{
    [ApiController]
    [Route("api/users")]
    [Authorize(Policy = "AdminOnly")]
    public class UsersController : ControllerBase
    {
        private readonly AppDbContext _db;

        public UsersController(AppDbContext db)
        {
            _db = db;
        }

        // GET ALL USERS
        [HttpGet]
        public async Task<ActionResult<IEnumerable<UserDto>>> GetUsers()
        {
            try
            {
                var users = await _db.Users
                    .Include(u => u.Role)
                    .ToListAsync();

                // To get pages efficiently, we might need a separate query or include
                // For now, let's load them for each user (N+1 query warning, but acceptable for smaller lists)
                // Or better: fetch all access and join in memory.
                
                var allAccess = await _db.UserPageAccess
                    .Include(upa => upa.Page)
                    .ToListAsync();

                var result = users.Select(u => new UserDto
                {
                    UserId = u.UserId,
                    ServiceId = u.ServiceId,
                    Name = u.Name,
                    Role = u.Role?.RoleName ?? "",
                    IsActive = u.IsActive,
                    LastLogin = u.LastLogin,
                    CreatedAt = u.CreatedAt,
                    UpdatedAt = u.UpdatedAt,
                    Pages = allAccess.Where(a => a.UserId == u.UserId).Select(a => a.Page?.PageName ?? "").ToList()
                }).ToList();

                return Ok(result);
            }
            catch (Exception ex)
            {
                return StatusCode(500, $"Error: {ex.Message}");
            }
        }

        // GET USER BY ID
        [HttpGet("{id}")]
        public async Task<ActionResult<UserDto>> GetUser(int id)
        {
            try
            {
                var user = await _db.Users
                    .Include(u => u.Role)
                    .FirstOrDefaultAsync(x => x.UserId == id);

                if (user == null) return NotFound();

                var pages = await _db.UserPageAccess
                    .Where(upa => upa.UserId == id)
                    .Select(upa => upa.Page != null ? upa.Page.PageName : "")
                    .ToListAsync();

                return new UserDto
                {
                    UserId = user.UserId,
                    ServiceId = user.ServiceId,
                    Name = user.Name,
                    Role = user.Role?.RoleName ?? "",
                    IsActive = user.IsActive,
                    LastLogin = user.LastLogin,
                    CreatedAt = user.CreatedAt,
                    UpdatedAt = user.UpdatedAt,
                    Pages = pages
                };
            }
            catch (Exception ex)
            {
                return StatusCode(500, $"Error: {ex.Message}");
            }
        }

        // CREATE USER
        [HttpPost]
        public async Task<ActionResult<UserDto>> CreateUser(CreateUserDto dto)
        {
            try
            {
                // Find Role
                var role = await _db.Roles.FirstOrDefaultAsync(r => r.RoleName == dto.Role);
                if (role == null)
                    return BadRequest($"Role '{dto.Role}' not found.");

                var user = new User
                {
                    ServiceId = dto.ServiceId,
                    Name = dto.Name,
                    RoleId = role.RoleId,
                    IsActive = dto.IsActive,
                    CreatedAt = DateTime.UtcNow
                };

                _db.Users.Add(user);
                await _db.SaveChangesAsync();

                // Add Pages
                if (dto.Pages != null && dto.Pages.Any())
                {
                    foreach (var pageName in dto.Pages)
                    {
                        var page = await _db.Pages.FirstOrDefaultAsync(p => p.PageName == pageName || p.PageCode == pageName);
                        if (page != null)
                        {
                            _db.UserPageAccess.Add(new UserPageAccess { UserId = user.UserId, PageId = page.PageId });
                        }
                    }
                    await _db.SaveChangesAsync();
                }

                return CreatedAtAction(nameof(GetUser), new { id = user.UserId }, new UserDto
                {
                    UserId = user.UserId,
                    ServiceId = user.ServiceId,
                    Name = user.Name,
                    Role = role.RoleName,
                    IsActive = user.IsActive,
                    Pages = dto.Pages ?? new List<string>(),
                    CreatedAt = user.CreatedAt
                });
            }
            catch (Exception ex)
            {
                return StatusCode(500, $"Error creating user: {ex.Message}");
            }
        }

        // UPDATE USER
        [HttpPut("{id}")]
        public async Task<ActionResult> UpdateUser(int id, UpdateUserDto dto)
        {
            try
            {
                var user = await _db.Users.FirstOrDefaultAsync(x => x.UserId == id);
                if (user == null) return NotFound();

                if (!string.IsNullOrEmpty(dto.ServiceId)) user.ServiceId = dto.ServiceId;
                if (!string.IsNullOrEmpty(dto.Name)) user.Name = dto.Name;
                if (dto.IsActive.HasValue) user.IsActive = dto.IsActive.Value;
                
                if (!string.IsNullOrEmpty(dto.Role))
                {
                    var role = await _db.Roles.FirstOrDefaultAsync(r => r.RoleName == dto.Role);
                    if (role != null) user.RoleId = role.RoleId;
                }

                user.UpdatedAt = DateTime.UtcNow;

                // Update Pages if provided
                if (dto.Pages != null)
                {
                    // Remove existing
                    var existing = _db.UserPageAccess.Where(x => x.UserId == id);
                    _db.UserPageAccess.RemoveRange(existing);

                    // Add new
                    foreach (var pageName in dto.Pages)
                    {
                        var page = await _db.Pages.FirstOrDefaultAsync(p => p.PageName == pageName || p.PageCode == pageName);
                        if (page != null)
                        {
                            _db.UserPageAccess.Add(new UserPageAccess { UserId = user.UserId, PageId = page.PageId });
                        }
                    }
                }

                await _db.SaveChangesAsync();
                return Ok("User updated successfully");
            }
            catch (Exception ex)
            {
                return StatusCode(500, $"Error updating user: {ex.Message}");
            }
        }

        // DELETE USER
        [HttpDelete("{id}")]
        public async Task<ActionResult> DeleteUser(int id)
        {
            try
            {
                var user = await _db.Users.FirstOrDefaultAsync(x => x.UserId == id);
                if (user == null) return NotFound();

                _db.Users.Remove(user);
                await _db.SaveChangesAsync();

                return Ok("User deleted successfully");
            }
            catch (Exception ex)
            {
                return StatusCode(500, $"Error deleting user: {ex.Message}");
            }
        }
    }
}