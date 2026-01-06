using backend.Data;
using backend.DTOs;
using backend.Models;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace backend.Controllers
{
    [ApiController]
    [Route("api/kpi-definitions")]
    public class KpiDefinitionsController : ControllerBase
    {
        private readonly AppDbContext _db;

        public KpiDefinitionsController(AppDbContext db)
        {
            _db = db;
        }

        [HttpGet]
        public async Task<ActionResult<List<KpiDefinitionDto>>> GetAll(
            [FromQuery] int? month,
            [FromQuery] int? year)
        {
            var q = _db.KpiDefinitions.AsNoTracking();

            if (month.HasValue) q = q.Where(x => x.Month == (byte)month.Value);
            if (year.HasValue) q = q.Where(x => x.Year == (short)year.Value);

            var data = await q.OrderBy(x => x.RowNumber).ToListAsync();
            return Ok(data.Select(ToDto));
        }

        [HttpPost]
        public async Task<ActionResult<KpiDefinitionDto>> Create(
            [FromBody] UpsertKpiDefinitionDto dto)
        {
            if (!ModelState.IsValid)
                return BadRequest(ModelState);

            var now = DateTime.UtcNow;
            var nowIso = now.ToString("o");

            var entity = new KpiDefinition
            {
                Id = Guid.NewGuid().ToString("N"),
                RowNumber = (byte)dto.RowNumber,
                Perspectives = dto.Perspectives.Trim(),
                StrategicObjectives = dto.StrategicObjectives.Trim(),
                KeyPerformanceIndicators = dto.KeyPerformanceIndicators.Trim(),
                Unit = dto.Unit.Trim(),
                DescriptionOfKPI = dto.DescriptionOfKPI.Trim(),
                Weightage = (byte)dto.Weightage,

                // ✅ NEW FIELD
                PointsApplicable = dto.PointsApplicable,

                Month = (byte)(dto.Month ?? now.Month),
                Year = (short)(dto.Year ?? now.Year),
                CreatedAt = nowIso,
                UpdatedAt = nowIso,
                V = 0
            };

            _db.KpiDefinitions.Add(entity);
            await _db.SaveChangesAsync();

            return Ok(ToDto(entity));
        }

        [HttpPut("{id}")]
        public async Task<ActionResult<KpiDefinitionDto>> Update(
            string id,
            [FromBody] UpsertKpiDefinitionDto dto)
        {
            var entity = await _db.KpiDefinitions.FirstOrDefaultAsync(x => x.Id == id);
            if (entity == null) return NotFound();

            entity.RowNumber = (byte)dto.RowNumber;
            entity.Perspectives = dto.Perspectives.Trim();
            entity.StrategicObjectives = dto.StrategicObjectives.Trim();
            entity.KeyPerformanceIndicators = dto.KeyPerformanceIndicators.Trim();
            entity.Unit = dto.Unit.Trim();
            entity.DescriptionOfKPI = dto.DescriptionOfKPI.Trim();
            entity.Weightage = (byte)dto.Weightage;

            // ✅ NEW FIELD
            entity.PointsApplicable = dto.PointsApplicable;

            entity.Month = (byte)(dto.Month ?? entity.Month);
            entity.Year = (short)(dto.Year ?? entity.Year);
            entity.UpdatedAt = DateTime.UtcNow.ToString("o");

            await _db.SaveChangesAsync();
            return Ok(ToDto(entity));
        }

        [HttpDelete("{id}")]
        public async Task<IActionResult> Delete(string id)
        {
            var entity = await _db.KpiDefinitions.FindAsync(id);
            if (entity == null) return NotFound();

            _db.KpiDefinitions.Remove(entity);
            await _db.SaveChangesAsync();
            return NoContent();
        }

        private static KpiDefinitionDto ToDto(KpiDefinition x) => new()
        {
            Id = x.Id,
            RowNumber = x.RowNumber,
            Perspectives = x.Perspectives,
            StrategicObjectives = x.StrategicObjectives,
            KeyPerformanceIndicators = x.KeyPerformanceIndicators,
            Unit = x.Unit,
            DescriptionOfKPI = x.DescriptionOfKPI,
            Weightage = x.Weightage,

            // ✅ NEW FIELD
            PointsApplicable = x.PointsApplicable ?? 0,

            CreatedAt = x.CreatedAt,
            UpdatedAt = x.UpdatedAt,
            V = x.V,
            Month = x.Month,
            Year = x.Year
        };
    }
}
