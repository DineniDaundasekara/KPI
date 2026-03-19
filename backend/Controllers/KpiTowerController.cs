/*
 * File: KpiTowerController.cs
 * Provides API endpoints for managing Tower Maintenance KPI records,
 * including retrieval, creation, update, and deletion with role-based authorization.
 */

using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using backend.Data;
using backend.Models;
using backend.Dtos;

using Microsoft.AspNetCore.Authorization;
using backend.Helpers.Authorization;

namespace backend.Controllers
{
    // =========================================================
    // KPI TOWER CONTROLLER
    // Handles Tower Maintenance KPI operations
    // =========================================================
    [ApiController]
    [Route("api/kpitower")]
    [Authorize]
    public class KpiTowerController : ControllerBase
    {
        // Database context for Tower KPI data
        private readonly AppDbContext _context;

        // Authorization service for policy-based permission checks
        private readonly IAuthorizationService _authorizationService;

        // Page identifier used for page-level authorization
        private const int PageId = 7;

        // Inject dependencies
        public KpiTowerController(AppDbContext context, IAuthorizationService authorizationService)
        {
            _context = context;
            _authorizationService = authorizationService;
        }

        // =========================================================
        // GET ALL TOWER KPI RECORDS
        // Requires ViewPagePolicy authorization
        // =========================================================
        [HttpGet]
        public async Task<ActionResult<IEnumerable<TowerKpi>>> GetAll()
        {
            // Check page-level view permission
            var authResult = await _authorizationService.AuthorizeAsync(User, PageId, "ViewPagePolicy");
            if (!authResult.Succeeded) return Forbid();

            // Retrieve records ordered by KPI number
            var list = await _context.TowerKpis
                .OrderBy(x => x.No)
                .ToListAsync();

            return Ok(list);
        }

        // =========================================================
        // GET TOWER KPI BY ID
        // Requires ViewPagePolicy authorization
        // =========================================================
        [HttpGet("{id}")]
        public async Task<ActionResult<TowerKpi>> GetById(int id)
        {
            // Check page-level view permission
            var authResult = await _authorizationService.AuthorizeAsync(User, PageId, "ViewPagePolicy");
            if (!authResult.Succeeded) return Forbid();

            // Find KPI record by primary key
            var item = await _context.TowerKpis.FindAsync(id);
            if (item == null) return NotFound();

            return Ok(item);
        }

        // =========================================================
        // CREATE NEW TOWER KPI
        // Requires Admin/SuperAdmin or EditPlatformKpiPolicy
        // =========================================================
        [HttpPost]
        public async Task<ActionResult<TowerKpi>> Create([FromBody] TowerKpiCreateDto dto)
        {
            // Allow admins directly, otherwise check edit permission
            bool isAdmin = User.IsInRole("Admin") || User.IsInRole("SuperAdmin");
            if (!isAdmin)
            {
                var auth = await _authorizationService.AuthorizeAsync(User, PageId, "EditPlatformKpiPolicy");
                if (!auth.Succeeded) return Forbid();
            }

            // Validate request body
            if (!ModelState.IsValid)
                return BadRequest(ModelState);

            // Validate and convert month value
            byte? month = null;
            if (dto.Month.HasValue)
            {
                if (dto.Month.Value < 1 || dto.Month.Value > 12)
                    return BadRequest("Month must be 1-12");

                month = (byte)dto.Month.Value;
            }

            // Validate and convert year value
            short? year = null;
            if (dto.Year.HasValue)
            {
                if (dto.Year.Value < short.MinValue || dto.Year.Value > short.MaxValue)
                    return BadRequest("Year out of range for Int16");

                year = (short)dto.Year.Value;
            }

            // Generate UTC timestamp string
            var now = DateTime.UtcNow.ToString("yyyy-MM-ddTHH:mm:ss.fffZ");

            // Create entity from DTO
            var entity = new TowerKpi
            {
                No = (byte)dto.No,
                Responsibility = dto.Responsibility,
                Frequency = dto.Frequency,
                Weightage = dto.Weightage,
                Kpi = dto.Kpi,
                Month = month,
                Year = year,
                CreatedAt = now,
                UpdatedAt = now,
                V = 0
            };

            // Insert record into database
            _context.TowerKpis.Add(entity);
            await _context.SaveChangesAsync();

            // Return created resource
            return CreatedAtAction(nameof(GetById), new { id = entity.Id }, entity);
        }

        // =========================================================
        // UPDATE EXISTING TOWER KPI
        // Requires Admin/SuperAdmin or EditPlatformKpiPolicy
        // =========================================================
        [HttpPut("{id}")]
        public async Task<ActionResult<TowerKpi>> Update(int id, [FromBody] TowerKpiUpdateDto dto)
        {
            // Allow admins directly, otherwise check edit permission
            bool isAdmin = User.IsInRole("Admin") || User.IsInRole("SuperAdmin");
            if (!isAdmin)
            {
                var auth = await _authorizationService.AuthorizeAsync(User, PageId, "EditPlatformKpiPolicy");
                if (!auth.Succeeded) return Forbid();
            }

            // Validate request body
            if (!ModelState.IsValid)
                return BadRequest(ModelState);

            // Retrieve existing record
            var entity = await _context.TowerKpis.FindAsync(id);
            if (entity == null)
                return NotFound();

            // Validate and update month value
            if (dto.Month.HasValue)
            {
                if (dto.Month.Value < 1 || dto.Month.Value > 12)
                    return BadRequest("Month must be 1-12");

                entity.Month = (byte)dto.Month.Value;
            }
            else
            {
                entity.Month = null;
            }

            // Validate and update year value
            if (dto.Year.HasValue)
            {
                if (dto.Year.Value < short.MinValue || dto.Year.Value > short.MaxValue)
                    return BadRequest("Year out of range for Int16");

                entity.Year = (short)dto.Year.Value;
            }
            else
            {
                entity.Year = null;
            }

            // Update main KPI fields
            entity.No = (byte)dto.No;
            entity.Responsibility = dto.Responsibility;
            entity.Frequency = dto.Frequency;
            entity.Weightage = dto.Weightage;
            entity.Kpi = dto.Kpi;

            // Update modification timestamp
            entity.UpdatedAt = DateTime.UtcNow.ToString("yyyy-MM-ddTHH:mm:ss.fffZ");

            await _context.SaveChangesAsync();

            return Ok(entity);
        }

        // =========================================================
        // DELETE TOWER KPI RECORD
        // Admin-only endpoint
        // =========================================================
        [HttpDelete("{id}")]
        [Authorize(Policy = "AdminOnly")]
        public async Task<IActionResult> Delete(int id)
        {
            // Find entity by ID
            var entity = await _context.TowerKpis.FindAsync(id);
            if (entity == null)
                return NotFound();

            // Remove record from database
            _context.TowerKpis.Remove(entity);
            await _context.SaveChangesAsync();

            return NoContent();
        }
    }
}