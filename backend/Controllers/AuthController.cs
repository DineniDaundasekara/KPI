using backend.Data;
using backend.Models;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using Microsoft.IdentityModel.Tokens;
using System.IdentityModel.Tokens.Jwt;
using System.Security.Claims;
using System.Text;

namespace backend.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class AuthController : ControllerBase
    {
        private readonly AppDbContext _context;
        private readonly IConfiguration _configuration;

        public AuthController(AppDbContext context, IConfiguration configuration)
        {
            _context = context;
            _configuration = configuration;
        }

        [HttpPost("login")]
        [AllowAnonymous] // Public endpoint
        public async Task<IActionResult> Login([FromBody] LoginDto dto)
        {
            if (string.IsNullOrWhiteSpace(dto.ServiceId))
                return BadRequest("Service ID is required.");

            // 1. Find User
            var user = await _context.Users
                .Include(u => u.Role)
                .FirstOrDefaultAsync(u => u.ServiceId == dto.ServiceId);

            if (user == null || !user.IsActive)
                return Unauthorized("Invalid Service ID or inactive account.");

            // 2. No Password Verification required (Service ID Only)

            // 3. Generate JWT
            var token = GenerateJwtToken(user);

            // 4. Update LastLogin
            user.LastLogin = DateTime.UtcNow;
            await _context.SaveChangesAsync();

            // 5. Get Allowed Pages
            var pages = await _context.UserPageAccess
                .Where(upa => upa.UserId == user.UserId)
                .Select(upa => upa.Page.PageName) // Or PageCode/PageId depending on what frontend needs
                .ToListAsync();

            var assignedPages = await _context.PlatformKpiAssignments
                .Where(pka => pka.UserId == user.UserId)
                .Select(pka => pka.Page.PageName)
                .ToListAsync();

            // Reconcile platform assignments for PlatformAdmin: ensure only one mapped page based on selected pages
            if (string.Equals(user.Role?.RoleName, "PlatformAdmin", StringComparison.OrdinalIgnoreCase))
            {
                var targetPageId = MapKnownPageId(pages.FirstOrDefault());

                if (targetPageId.HasValue)
                {
                    // If assignments differ, reset to the single target page
                    var existingIds = await _context.PlatformKpiAssignments
                        .Where(pka => pka.UserId == user.UserId)
                        .Select(pka => pka.PageId)
                        .ToListAsync();

                    if (existingIds.Count != 1 || existingIds[0] != targetPageId.Value)
                    {
                        var toRemove = _context.PlatformKpiAssignments.Where(pka => pka.UserId == user.UserId);
                        _context.PlatformKpiAssignments.RemoveRange(toRemove);

                        _context.PlatformKpiAssignments.Add(new PlatformKpiAssignment
                        {
                            UserId = user.UserId,
                            PageId = targetPageId.Value
                        });

                        await _context.SaveChangesAsync();

                        assignedPages = await _context.PlatformKpiAssignments
                            .Where(pka => pka.UserId == user.UserId)
                            .Select(pka => pka.Page.PageName)
                            .ToListAsync();
                    }
                }
            }

            return Ok(new { token, user.Name, Role = user.Role?.RoleName, Pages = pages, AssignedPages = assignedPages });
        }

        private string GenerateJwtToken(User user)
        {
            var jwtSettings = _configuration.GetSection("JwtSettings");
            var secretKey = jwtSettings["Secret"] ?? "SuperSecretKeyForDevelopmentOnly12345!@#$%"; // Fallback if config missing
            var key = new SymmetricSecurityKey(Encoding.UTF8.GetBytes(secretKey));
            var creds = new SigningCredentials(key, SecurityAlgorithms.HmacSha256);

            var claims = new List<Claim>
            {
                new Claim(ClaimTypes.NameIdentifier, user.ServiceId),
                new Claim("ServiceId", user.ServiceId), // Custom claim
                new Claim("serviceId", user.ServiceId),
                new Claim(ClaimTypes.Role, user.Role?.RoleName ?? "User"),
                new Claim("role", user.Role?.RoleName ?? "User"),
                new Claim("UserId", user.UserId.ToString())
            };

            var token = new JwtSecurityToken(
                issuer: jwtSettings["Issuer"] ?? "KPI_Backend",
                audience: jwtSettings["Audience"] ?? "KPI_Frontend",
                claims: claims,
                expires: DateTime.UtcNow.AddHours(8),
                signingCredentials: creds
            );

            return new JwtSecurityTokenHandler().WriteToken(token);
        }

        private static byte? MapKnownPageId(string? input)
        {
            var key = NormalizeKey(input);
            if (string.IsNullOrEmpty(key)) return null;

            return key switch
            {
                "ipnwop" => (byte)1,
                "servicefulfilment" => (byte)2,
                "bbanw" => (byte)3,
                "otonop" => (byte)4,
                "tmactivityplan" => (byte)5,
                "routinemtnc" => (byte)6,
                "towermtceachievement" => (byte)7,
                _ => null
            };
        }

        private static string NormalizeKey(string? value)
        {
            return new string((value ?? string.Empty)
                .ToLowerInvariant()
                .Where(char.IsLetterOrDigit)
                .ToArray());
        }
    }

    public class LoginDto
    {
        public string ServiceId { get; set; }
    }
}
