using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace backend.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class TestAuthController : ControllerBase
    {
        [HttpGet("public")]
        public IActionResult GetPublic()
        {
            return Ok("Public endpoint");
        }

        [HttpGet("authenticated")]
        [Authorize]
        public IActionResult GetAuthenticated()
        {
            return Ok($"Authenticated as {User.Identity?.Name}. Claims: {string.Join(", ", User.Claims.Select(c => $"{c.Type}={c.Value}"))}");
        }

        [HttpGet("superadmin")]
        [Authorize(Policy = "SuperAdminOnly")]
        public IActionResult GetSuperAdmin()
        {
            return Ok("SuperAdmin access granted");
        }

        [HttpGet("admin")]
        [Authorize(Policy = "AdminOnly")]
        public IActionResult GetAdmin()
        {
            return Ok("Admin access granted");
        }

        [HttpGet("platformadmin")]
        [Authorize(Policy = "PlatformAdminOnly")]
        public IActionResult GetPlatformAdmin()
        {
            return Ok("PlatformAdmin access granted");
        }

        // Specific page access
        [HttpGet("page/{pageId}")]
        [Authorize(Policy = "ViewPagePolicy")]
        public IActionResult GetPage(int pageId)
        {
            return Ok($"Access to page {pageId} granted");
        }

        // Platform KPI Edit
        [HttpPost("kpi/{pageId}/edit")]
        [Authorize(Policy = "EditPlatformKpiPolicy")]
        public IActionResult EditKpi(int pageId)
        {
            return Ok($"Edit access to KPI page {pageId} granted (Date <= 15th)");
        }
    }
}
