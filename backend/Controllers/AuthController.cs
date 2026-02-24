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

            return await GenerateLoginResponse(user);
        }

        [HttpPost("verify-azure-login")]
        [AllowAnonymous]
        public async Task<IActionResult> VerifyAzureLogin([FromBody] VerifyAzureLoginDto dto)
        {
            if (string.IsNullOrWhiteSpace(dto.Email) || string.IsNullOrWhiteSpace(dto.ServiceId))
                return BadRequest("Email and Service ID are required.");

            // 1. Find User by ServiceId ONLY first
            var user = await _context.Users
                .Include(u => u.Role)
                .FirstOrDefaultAsync(u => u.ServiceId == dto.ServiceId);

            if (user == null)
                return Unauthorized("The provided Service ID does not exist.");

            if (!user.IsActive)
                return Unauthorized("User account is inactive.");

            // 2. Check and Link Email
            // Logic: If user has a dummy/internal email or no email, link it to the current Azure email.
            // This handles the transition from Service ID-only login to Azure login.
            bool isDummyOrMissingEmail = string.IsNullOrWhiteSpace(user.Email) || 
                                       user.Email.EndsWith("@internal.slt", StringComparison.OrdinalIgnoreCase);

            if (isDummyOrMissingEmail)
            {
                // Link the account to this Azure email permanently
                user.Email = dto.Email;
                await _context.SaveChangesAsync();
            }
            else if (!string.Equals(user.Email, dto.Email, StringComparison.OrdinalIgnoreCase))
            {
                // Strict check: if a real email already exists, it must match the one used to sign in
                return Unauthorized("This Service ID is already linked to a different Microsoft account.");
            }

            return await GenerateLoginResponse(user);
        }

        private async Task<IActionResult> GenerateLoginResponse(User user)
        {
            // 1. Generate JWT
            var token = GenerateJwtToken(user);

            // 2. Update LastLogin
            user.LastLogin = DateTime.UtcNow;
            await _context.SaveChangesAsync();

            // 3. Get Allowed Pages
            var pages = await _context.UserPageAccess
                .Where(upa => upa.UserId == user.UserId)
                .Select(upa => upa.Page.PageName)
                .ToListAsync();

            var assignedPages = await _context.PlatformKpiAssignments
                .Where(pka => pka.UserId == user.UserId)
                .Select(pka => pka.Page.PageName)
                .ToListAsync();

            // 4. Reconcile platform assignments for PlatformAdmin
            if (string.Equals(user.Role?.RoleName, "PlatformAdmin", StringComparison.OrdinalIgnoreCase))
            {
                var targetPageId = MapKnownPageId(pages.FirstOrDefault());

                if (targetPageId.HasValue)
                {
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

    public class VerifyAzureLoginDto
    {
        public string Email { get; set; }
        public string ServiceId { get; set; }
    }
}
