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
            var users = await _db.Users.Include(u => u.Pages).ToListAsync();

            var result = users.Select(u => new UserDto
            {
                Id = u.Id,
                Name = u.Name,
                Username = u.Username,
                Role = u.Role,
                Pages = u.Pages.Select(p => p.PageName).ToList()
            });

            return Ok(result);
        }

        // ✔ GET USER BY ID
        [HttpGet("{id}")]
        public async Task<ActionResult<UserDto>> GetUser(int id)
        {
            var user = await _db.Users.Include(u => u.Pages).FirstOrDefaultAsync(x => x.Id == id);

            if (user == null) return NotFound();

            return new UserDto
            {
                Id = user.Id,
                Name = user.Name,
                Username = user.Username,
                Role = user.Role,
                Pages = user.Pages.Select(p => p.PageName).ToList()
            };
        }

        // ✔ CREATE USER
        [HttpPost]
        public async Task<ActionResult> CreateUser(CreateUserDto dto)
        {
            var user = new User
            {
                Name = dto.Name,
                Username = dto.Username,
                Role = dto.Role,
                Pages = dto.Pages.Select(p => new UserPage { PageName = p }).ToList()
            };

            _db.Users.Add(user);
            await _db.SaveChangesAsync();

            return Ok("User created successfully");
        }

        // ✔ UPDATE USER
        [HttpPut("{id}")]
        public async Task<ActionResult> UpdateUser(int id, CreateUserDto dto)
        {
            var user = await _db.Users
                .Include(u => u.Pages)
                .FirstOrDefaultAsync(x => x.Id == id);

            if (user == null) return NotFound();

            user.Name = dto.Name;
            user.Username = dto.Username;
            user.Role = dto.Role;

            _db.UserPages.RemoveRange(user.Pages);

            user.Pages = dto.Pages.Select(p => new UserPage { PageName = p }).ToList();

            await _db.SaveChangesAsync();
            return Ok("User updated successfully");
        }

        // ✔ DELETE USER
        [HttpDelete("{id}")]
        public async Task<ActionResult> DeleteUser(int id)
        {
            var user = await _db.Users.Include(u => u.Pages).FirstOrDefaultAsync(x => x.Id == id);

            if (user == null) return NotFound();

            _db.UserPages.RemoveRange(user.Pages);
            _db.Users.Remove(user);

            await _db.SaveChangesAsync();
            return Ok("User deleted successfully");
        }
    }
}
