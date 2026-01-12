using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using backend.Data;
using backend.Models;
using backend.DTOs;

namespace backend.Controllers
{
    [ApiController]
    [Route("api/users")]
    public class UsersController : ControllerBase
    {
        private readonly AppDbContext _db;

        public UsersController(AppDbContext db)
        {
            _db = db;
        }

        // ✔ GET ALL USERS
        [HttpGet]
        public async Task<ActionResult<IEnumerable<UserDto>>> GetUsers()
        {
            try
            {
                var users = await _db.Users.ToListAsync();

                var result = users.Select(u => new UserDto
                {
                    id = u.id ?? "",
                    name = u.name ?? "",
                    username = u.username, // Can be null
                    role = u.role ?? "",
                    isActive = u.isActive ?? "",
                    Pages = u.Pages,
                    createdAt = u.createdAt ?? "",
                    updatedAt = u.updatedAt ?? "",
                    v = u.v // Can be null
                });

                return Ok(result);
            }
            catch (Exception ex)
            {
                return StatusCode(500, $"Error: {ex.Message}\nStack Trace: {ex.StackTrace}");
            }
        }

        // ✔ GET USER BY ID
        [HttpGet("{id}")]
        public async Task<ActionResult<UserDto>> GetUser(string id)
        {
            try
            {
                var user = await _db.Users.FirstOrDefaultAsync(x => x.id == id);

                if (user == null) return NotFound();

                return new UserDto
                {
                    id = user.id ?? "",
                    name = user.name ?? "",
                    username = user.username,
                    role = user.role ?? "",
                    isActive = user.isActive ?? "",
                    Pages = user.Pages,
                    createdAt = user.createdAt ?? "",
                    updatedAt = user.updatedAt ?? "",
                    v = user.v
                };
            }
            catch (Exception ex)
            {
                return StatusCode(500, $"Error: {ex.Message}\nStack Trace: {ex.StackTrace}");
            }
        }

        // ✔ CREATE USER
        [HttpPost]
        public async Task<ActionResult<UserDto>> CreateUser(CreateUserDto dto)
        {
            try
            {
                var newId = Guid.NewGuid().ToString();

                var user = new User
                {
                    id = newId,
                    username = dto.username, // This is non-nullable in CreateUserDto
                    name = dto.name,
                    role = dto.role,
                    isActive = dto.isActive,
                    Pages = dto.pages,
                    createdAt = DateTime.UtcNow.ToString("yyyy-MM-ddTHH:mm:ss.fffZ"),
                    updatedAt = DateTime.UtcNow.ToString("yyyy-MM-ddTHH:mm:ss.fffZ"),
                    v = false // Default value
                };

                _db.Users.Add(user);
                await _db.SaveChangesAsync();

                return CreatedAtAction(nameof(GetUser), new { id = user.id }, new UserDto
                {
                    id = user.id,
                    name = user.name,
                    username = user.username,
                    role = user.role,
                    isActive = user.isActive,
                    Pages = user.Pages,
                    createdAt = user.createdAt,
                    updatedAt = user.updatedAt,
                    v = user.v
                });
            }
            catch (Exception ex)
            {
                return StatusCode(500, $"Error creating user: {ex.Message}\nStack Trace: {ex.StackTrace}");
            }
        }

        // ✔ UPDATE USER
        [HttpPut("{id}")]
        public async Task<ActionResult> UpdateUser(string id, UpdateUserDto dto)
        {
            try
            {
                var user = await _db.Users.FirstOrDefaultAsync(x => x.id == id);

                if (user == null) return NotFound();

                // Update only provided fields
                if (dto.username.HasValue)
                    user.username = dto.username.Value;

                if (!string.IsNullOrEmpty(dto.name))
                    user.name = dto.name;

                if (!string.IsNullOrEmpty(dto.role))
                    user.role = dto.role;

                if (!string.IsNullOrEmpty(dto.isActive))
                    user.isActive = dto.isActive;

                if (dto.pages != null)
                    user.Pages = dto.pages;

                user.updatedAt = DateTime.UtcNow.ToString("yyyy-MM-ddTHH:mm:ss.fffZ");

                await _db.SaveChangesAsync();
                return Ok("User updated successfully");
            }
            catch (Exception ex)
            {
                return StatusCode(500, $"Error updating user: {ex.Message}\nStack Trace: {ex.StackTrace}");
            }
        }

        // ✔ DELETE USER
        [HttpDelete("{id}")]
        public async Task<ActionResult> DeleteUser(string id)
        {
            try
            {
                var user = await _db.Users.FirstOrDefaultAsync(x => x.id == id);

                if (user == null) return NotFound();

                _db.Users.Remove(user);
                await _db.SaveChangesAsync();

                return Ok("User deleted successfully");
            }
            catch (Exception ex)
            {
                return StatusCode(500, $"Error deleting user: {ex.Message}\nStack Trace: {ex.StackTrace}");
            }
        }

        // Optional: Get User by username
        [HttpGet("by-username/{username}")]
        public async Task<ActionResult<UserDto>> GetUserByUsername(short username)
        {
            try
            {
                var user = await _db.Users.FirstOrDefaultAsync(x => x.username == username);

                if (user == null) return NotFound();

                return new UserDto
                {
                    id = user.id ?? "",
                    name = user.name ?? "",
                    username = user.username,
                    role = user.role ?? "",
                    isActive = user.isActive ?? "",
                    Pages = user.Pages,
                    createdAt = user.createdAt ?? "",
                    updatedAt = user.updatedAt ?? "",
                    v = user.v
                };
            }
            catch (Exception ex)
            {
                return StatusCode(500, $"Error: {ex.Message}\nStack Trace: {ex.StackTrace}");
            }
        }

        // Add a test endpoint to check database
        [HttpGet("test-db")]
        public async Task<ActionResult> TestDb()
        {
            try
            {
                var count = await _db.Users.CountAsync();
                var sample = await _db.Users.FirstOrDefaultAsync();

                return Ok(new
                {
                    totalUsers = count,
                    sampleUser = sample,
                    connection = "Database connection successful"
                });
            }
            catch (Exception ex)
            {
                return StatusCode(500, new
                {
                    error = ex.Message,
                    innerError = ex.InnerException?.Message,
                    stackTrace = ex.StackTrace
                });
            }
        }
    }
}