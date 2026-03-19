/*
 * File: KpiDefinitionsController.cs
 * Provides API endpoints for managing KPI definitions, including creation,
 * retrieval, update, deletion, and automatic weightage recalculation.
 */

using backend.Data;
using backend.DTOs;
using backend.Models;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using Microsoft.AspNetCore.Authorization;

namespace backend.Controllers
{
    // =========================================================
    // KPI DEFINITIONS CONTROLLER
    // Handles CRUD operations for KPI definition records
    // =========================================================
    [ApiController]
    [Route("api/kpi-definitions")]
    [Authorize]
    public class KpiDefinitionsController : ControllerBase
    {
        // Database context for accessing KPI definition data
        private readonly AppDbContext _db;

        // Inject database context
        public KpiDefinitionsController(AppDbContext db)
        {
            _db = db;
        }

        // =========================================================
        // GET KPI DEFINITIONS
        // Optional filtering by month and year
        // If no records found for provided filters, fallback to
        // the latest available month/year dataset
        // =========================================================
        [HttpGet]
        public async Task<ActionResult<List<KpiDefinitionDto>>> GetAll(
            [FromQuery] int? month,
            [FromQuery] int? year)
        {
            // Base query with no tracking for read-only performance
            var q = _db.KpiDefinitions.AsNoTracking();

            // Determine if filters were provided
            var hasFilters = month.HasValue || year.HasValue;

            // Apply month filter if provided
            if (month.HasValue)
                q = q.Where(x => x.Month == (byte)month.Value);

            // Apply year filter if provided
            if (year.HasValue)
                q = q.Where(x => x.Year == (short)year.Value);

            // Execute query ordered by primary key
            var data = await q
                .OrderBy(x => x.Id)
                .ToListAsync();

            // If filters were used but no results found,
            // fallback to the most recent dataset
            if (hasFilters && data.Count == 0)
            {
                var latest = await _db.KpiDefinitions
                    .AsNoTracking()
                    .OrderByDescending(x => x.Year)
                    .ThenByDescending(x => x.Month)
                    .Select(x => new { x.Month, x.Year })
                    .FirstOrDefaultAsync();

                if (latest != null)
                {
                    data = await _db.KpiDefinitions
                        .AsNoTracking()
                        .Where(x => x.Month == latest.Month && x.Year == latest.Year)
                        .OrderBy(x => x.Id)
                        .ToListAsync();
                }
            }

            // Map entities to DTOs before returning response
            return Ok(data.Select(ToDto));
        }

        // =========================================================
        // CREATE NEW KPI DEFINITION
        // Admin-only endpoint
        // Inserts new record and recalculates weightage for
        // the corresponding month/year group
        // =========================================================
        [HttpPost]
        [Authorize(Policy = "AdminOnly")]
        public async Task<ActionResult<KpiDefinitionDto>> Create([FromBody] UpsertKpiDefinitionDto dto)
        {
            // Validate request body
            if (!ModelState.IsValid)
                return BadRequest(ModelState);

            // Generate timestamps in ISO format
            var now = DateTime.UtcNow;
            var nowIso = now.ToString("o");

            // Default month/year to current if not provided
            byte month = (byte)(dto.Month ?? now.Month);
            short year = (short)(dto.Year ?? now.Year);

            // Create new entity from DTO
            var entity = new KpiDefinition
            {
                Perspectives = dto.Perspectives.Trim(),
                StrategicObjectives = dto.StrategicObjectives.Trim(),
                KeyPerformanceIndicators = dto.KeyPerformanceIndicators.Trim(),
                Unit = dto.Unit.Trim(),
                DescriptionOfKPI = dto.DescriptionOfKPI.Trim(),

                PointsApplicable = dto.PointsApplicable,

                // Weightage is recalculated after insert
                Weightage = 0m,

                Month = month,
                Year = year,
                CreatedAt = nowIso,
                UpdatedAt = nowIso
            };

            // Insert new record
            _db.KpiDefinitions.Add(entity);
            await _db.SaveChangesAsync();

            // Recalculate weightage for the month/year group
            await RecalculateWeightageAsync(month, year);

            // Retrieve updated entity with recalculated weightage
            var updated = await _db.KpiDefinitions
                .AsNoTracking()
                .FirstAsync(x => x.Id == entity.Id);

            return Ok(ToDto(updated));
        }

        // =========================================================
        // UPDATE KPI DEFINITION
        // Admin-only endpoint
        // Updates existing record and recalculates weightage
        // =========================================================
        [HttpPut("{id}")]
        [Authorize(Policy = "AdminOnly")]
        public async Task<ActionResult<KpiDefinitionDto>> Update(int id, [FromBody] UpsertKpiDefinitionDto dto)
        {
            // Validate request body
            if (!ModelState.IsValid)
                return BadRequest(ModelState);

            // Fetch entity from database
            var entity = await _db.KpiDefinitions.FirstOrDefaultAsync(x => x.Id == id);
            if (entity == null) return NotFound();

            // Preserve original month/year to detect group changes
            var oldMonth = entity.Month;
            var oldYear = entity.Year;

            // Update fields
            entity.Perspectives = dto.Perspectives.Trim();
            entity.StrategicObjectives = dto.StrategicObjectives.Trim();
            entity.KeyPerformanceIndicators = dto.KeyPerformanceIndicators.Trim();
            entity.Unit = dto.Unit.Trim();
            entity.DescriptionOfKPI = dto.DescriptionOfKPI.Trim();

            entity.PointsApplicable = dto.PointsApplicable;

            // Update month/year only if values were provided
            entity.Month = dto.Month.HasValue ? (byte)dto.Month.Value : entity.Month;
            entity.Year = dto.Year.HasValue ? (short)dto.Year.Value : entity.Year;

            // Update modification timestamp
            entity.UpdatedAt = DateTime.UtcNow.ToString("o");

            await _db.SaveChangesAsync();

            // Recalculate weightage for old group (if moved) and new group
            await RecalculateWeightageAsync(oldMonth, oldYear);
            await RecalculateWeightageAsync(entity.Month, entity.Year);

            // Fetch updated record
            var updated = await _db.KpiDefinitions
                .AsNoTracking()
                .FirstAsync(x => x.Id == entity.Id);

            return Ok(ToDto(updated));
        }

        // =========================================================
        // DELETE KPI DEFINITION
        // Admin-only endpoint
        // Removes record and recalculates group weightage
        // =========================================================
        [HttpDelete("{id}")]
        [Authorize(Policy = "AdminOnly")]
        public async Task<IActionResult> Delete(int id)
        {
            // Find entity by ID
            var entity = await _db.KpiDefinitions.FirstOrDefaultAsync(x => x.Id == id);
            if (entity == null) return NotFound();

            // Store month/year before deletion
            var month = entity.Month;
            var year = entity.Year;

            // Remove record
            _db.KpiDefinitions.Remove(entity);
            await _db.SaveChangesAsync();

            // Recalculate weightage for affected group
            await RecalculateWeightageAsync(month, year);

            return NoContent();
        }

        // =========================================================
        // RECALCULATE KPI WEIGHTAGE
        // Calculates percentage weightage for all KPIs
        // within the same month/year group
        // =========================================================
        private async Task RecalculateWeightageAsync(byte month, short year)
        {
            // Retrieve all KPI definitions in the specified group
            var rows = await _db.KpiDefinitions
                .Where(x => x.Month == month && x.Year == year)
                .ToListAsync();

            // Calculate total points for the group
            var totalPoints = rows.Sum(x => (decimal)x.PointsApplicable);

            foreach (var r in rows)
            {
                var points = (decimal)r.PointsApplicable;

                // Calculate weightage percentage
                r.Weightage = totalPoints <= 0m
                    ? 0m
                    : Math.Round((points / totalPoints) * 100m, 4);
            }

            await _db.SaveChangesAsync();
        }

        // =========================================================
        // ENTITY TO DTO MAPPING
        // Converts database entity to API response DTO
        // =========================================================
        private static KpiDefinitionDto ToDto(KpiDefinition x) => new()
        {
            Id = x.Id,
            Perspectives = x.Perspectives,
            StrategicObjectives = x.StrategicObjectives,
            KeyPerformanceIndicators = x.KeyPerformanceIndicators,
            Unit = x.Unit,
            DescriptionOfKPI = x.DescriptionOfKPI,
            Weightage = x.Weightage,
            PointsApplicable = x.PointsApplicable,
            CreatedAt = x.CreatedAt,
            UpdatedAt = x.UpdatedAt,
            Month = x.Month,
            Year = x.Year
        };
    }
}