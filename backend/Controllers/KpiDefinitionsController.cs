using backend.Data;
using backend.DTOs;
using backend.Models;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using Microsoft.AspNetCore.Authorization;

namespace backend.Controllers
{
    [ApiController]
    [Route("api/kpi-definitions")]
    [Authorize]
    public class KpiDefinitionsController : ControllerBase
    {
        private readonly AppDbContext _db;

        public KpiDefinitionsController(AppDbContext db)
        {
            _db = db;
        }

        // =========================
        // GET (optional month/year)
        // =========================
        [HttpGet]
        public async Task<ActionResult<List<KpiDefinitionDto>>> GetAll(
            [FromQuery] int? month,
            [FromQuery] int? year)
        {
            var q = _db.KpiDefinitions.AsNoTracking();
            var hasFilters = month.HasValue || year.HasValue;

            if (month.HasValue)
                q = q.Where(x => x.Month == (byte)month.Value);

            if (year.HasValue)
                q = q.Where(x => x.Year == (short)year.Value);

            var data = await q
                .OrderBy(x => x.Id) // ✅ RowNumber removed, so order by Id
                .ToListAsync();

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

            return Ok(data.Select(ToDto));
        }

        // =========================
        // CREATE
        // =========================
        [HttpPost]
        [Authorize(Policy = "AdminOnly")]
        public async Task<ActionResult<KpiDefinitionDto>> Create([FromBody] UpsertKpiDefinitionDto dto)
        {
            if (!ModelState.IsValid)
                return BadRequest(ModelState);

            var now = DateTime.UtcNow;
            var nowIso = now.ToString("o");

            byte month = (byte)(dto.Month ?? now.Month);
            short year = (short)(dto.Year ?? now.Year);

            var entity = new KpiDefinition
            {
                Perspectives = dto.Perspectives.Trim(),
                StrategicObjectives = dto.StrategicObjectives.Trim(),
                KeyPerformanceIndicators = dto.KeyPerformanceIndicators.Trim(),
                Unit = dto.Unit.Trim(),
                DescriptionOfKPI = dto.DescriptionOfKPI.Trim(),

                PointsApplicable = dto.PointsApplicable,
                Weightage = 0m, // recalculated

                Month = month,
                Year = year,
                CreatedAt = nowIso,
                UpdatedAt = nowIso
            };

            _db.KpiDefinitions.Add(entity);
            await _db.SaveChangesAsync();

            await RecalculateWeightageAsync(month, year);

            var updated = await _db.KpiDefinitions
                .AsNoTracking()
                .FirstAsync(x => x.Id == entity.Id);

            return Ok(ToDto(updated));
        }

        // =========================
        // UPDATE
        // =========================
        [HttpPut("{id}")]
        [Authorize(Policy = "AdminOnly")]
        public async Task<ActionResult<KpiDefinitionDto>> Update(int id, [FromBody] UpsertKpiDefinitionDto dto)
        {
            if (!ModelState.IsValid)
                return BadRequest(ModelState);

            var entity = await _db.KpiDefinitions.FirstOrDefaultAsync(x => x.Id == id);
            if (entity == null) return NotFound();

            var oldMonth = entity.Month;
            var oldYear = entity.Year;

            entity.Perspectives = dto.Perspectives.Trim();
            entity.StrategicObjectives = dto.StrategicObjectives.Trim();
            entity.KeyPerformanceIndicators = dto.KeyPerformanceIndicators.Trim();
            entity.Unit = dto.Unit.Trim();
            entity.DescriptionOfKPI = dto.DescriptionOfKPI.Trim();

            entity.PointsApplicable = dto.PointsApplicable;

            // ✅ FIX: Month/Year nullable handling (no ?? with byte/short)
            entity.Month = dto.Month.HasValue ? (byte)dto.Month.Value : entity.Month;
            entity.Year = dto.Year.HasValue ? (short)dto.Year.Value : entity.Year;

            entity.UpdatedAt = DateTime.UtcNow.ToString("o");

            await _db.SaveChangesAsync();

            // ✅ recalc old group (if moved) + new group
            await RecalculateWeightageAsync(oldMonth, oldYear);
            await RecalculateWeightageAsync(entity.Month, entity.Year);

            var updated = await _db.KpiDefinitions
                .AsNoTracking()
                .FirstAsync(x => x.Id == entity.Id);

            return Ok(ToDto(updated));
        }

        // =========================
        // DELETE
        // =========================
        [HttpDelete("{id}")]
        [Authorize(Policy = "AdminOnly")]
        public async Task<IActionResult> Delete(int id)
        {
            var entity = await _db.KpiDefinitions.FirstOrDefaultAsync(x => x.Id == id);
            if (entity == null) return NotFound();

            var month = entity.Month;
            var year = entity.Year;

            _db.KpiDefinitions.Remove(entity);
            await _db.SaveChangesAsync();

            await RecalculateWeightageAsync(month, year);

            return NoContent();
        }

        // =========================
        // WEIGHTAGE CALCULATION
        // =========================
        private async Task RecalculateWeightageAsync(byte month, short year)
        {
            // tracking ON because we update Weightage
            var rows = await _db.KpiDefinitions
                .Where(x => x.Month == month && x.Year == year)
                .ToListAsync();

            var totalPoints = rows.Sum(x => (decimal)x.PointsApplicable);

            foreach (var r in rows)
            {
                var points = (decimal)r.PointsApplicable;

                r.Weightage = totalPoints <= 0m
                    ? 0m
                    : Math.Round((points / totalPoints) * 100m, 4);
            }

            await _db.SaveChangesAsync();
        }

        // =========================
        // MAPPING
        // =========================
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
