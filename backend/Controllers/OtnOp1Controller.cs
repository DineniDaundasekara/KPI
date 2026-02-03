using backend.Data;
using backend.DTOs;
using backend.Models;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace backend.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class OtnOp1Controller : ControllerBase
    {
        private readonly AppDbContext _db;

        public OtnOp1Controller(AppDbContext db)
        {
            _db = db;
        }

        // GET: api/OtnOp1
        [HttpGet]
        public async Task<ActionResult<IEnumerable<OtnOp1Dto>>> GetAll()
        {
            var items = await _db.OtnOp1
                .AsNoTracking()
                .OrderBy(x => x.Id)
                .Select(x => new OtnOp1Dto
                {
                    Id = x.Id,
                    NetworkEngineerKpi = x.NetworkEngineerKpi,
                    Division = x.Division,
                    Section = x.Section,
                    KpiPercent = x.KpiPercent
                })
                .ToListAsync();

            return Ok(items);
        }

        // GET: api/OtnOp1/5
        [HttpGet("{id:int}")]
        public async Task<ActionResult<OtnOp1Dto>> GetById(int id)
        {
            var item = await _db.OtnOp1
                .AsNoTracking()
                .Where(x => x.Id == id)
                .Select(x => new OtnOp1Dto
                {
                    Id = x.Id,
                    NetworkEngineerKpi = x.NetworkEngineerKpi,
                    Division = x.Division,
                    Section = x.Section,
                    KpiPercent = x.KpiPercent
                })
                .FirstOrDefaultAsync();

            if (item == null) return NotFound();
            return Ok(item);
        }

        // POST: api/OtnOp1
        [HttpPost]
        public async Task<ActionResult<OtnOp1Dto>> Create([FromBody] CreateOtnOp1Dto dto)
        {
            if (string.IsNullOrWhiteSpace(dto.NetworkEngineerKpi))
                return BadRequest("NetworkEngineerKpi is required.");

            var entity = new OtnOp1
            {
                NetworkEngineerKpi = dto.NetworkEngineerKpi.Trim(),
                Division = dto.Division,
                Section = dto.Section,
                KpiPercent = dto.KpiPercent
            };

            _db.OtnOp1.Add(entity);
            await _db.SaveChangesAsync();

            var result = new OtnOp1Dto
            {
                Id = entity.Id,
                NetworkEngineerKpi = entity.NetworkEngineerKpi,
                Division = entity.Division,
                Section = entity.Section,
                KpiPercent = entity.KpiPercent
            };

            return CreatedAtAction(nameof(GetById), new { id = entity.Id }, result);
        }

        // PUT: api/OtnOp1/5
        [HttpPut("{id:int}")]
        public async Task<IActionResult> Update(int id, [FromBody] CreateOtnOp1Dto dto)
        {
            var entity = await _db.OtnOp1.FirstOrDefaultAsync(x => x.Id == id);
            if (entity == null) return NotFound();

            if (string.IsNullOrWhiteSpace(dto.NetworkEngineerKpi))
                return BadRequest("NetworkEngineerKpi is required.");

            entity.NetworkEngineerKpi = dto.NetworkEngineerKpi.Trim();
            entity.Division = dto.Division;
            entity.Section = dto.Section;
            entity.KpiPercent = dto.KpiPercent;

            await _db.SaveChangesAsync();
            return NoContent();
        }

        // DELETE: api/OtnOp1/5
        // Cascade deletes metrics due to FK
        [HttpDelete("{id:int}")]
        public async Task<IActionResult> Delete(int id)
        {
            var entity = await _db.OtnOp1.FirstOrDefaultAsync(x => x.Id == id);
            if (entity == null) return NotFound();

            _db.OtnOp1.Remove(entity);
            await _db.SaveChangesAsync();
            return NoContent();
        }

        // GET: api/OtnOp1/5/metrics?year=2026&month=1
        [HttpGet("{id:int}/metrics")]
        public async Task<ActionResult<IEnumerable<OtnOp1MetricDto>>> GetMetrics(
            int id,
            [FromQuery] short year,
            [FromQuery] byte month)
        {
            var exists = await _db.OtnOp1.AsNoTracking().AnyAsync(x => x.Id == id);
            if (!exists) return NotFound("KPI not found.");

            var rows = await _db.OtnOp1Metrics
                .AsNoTracking()
                .Where(m => m.OtnOp1Id == id && m.Year == year && m.Month == month)
                .OrderBy(m => m.Site)
                .Select(m => new OtnOp1MetricDto
                {
                    Id = m.Id,
                    OtnOp1Id = m.OtnOp1Id,
                    Site = m.Site,
                    UnavailableMinutes = m.UnavailableMinutes,
                    TotalMinutes = m.TotalMinutes,
                    TotalNodes = m.TotalNodes,
                    Year = m.Year,
                    Month = m.Month
                })
                .ToListAsync();

            return Ok(rows);
        }

        // POST: api/OtnOp1/5/metrics
        // Bulk upsert (insert new or update existing) based on unique key (OtnOp1Id, Site, Year, Month)
        [HttpPost("{id:int}/metrics")]
        public async Task<IActionResult> UpsertMetrics(int id, [FromBody] List<OtnOp1MetricDto> metrics)
        {
            var exists = await _db.OtnOp1.AnyAsync(x => x.Id == id);
            if (!exists) return NotFound("KPI not found.");

            if (metrics == null || metrics.Count == 0)
                return BadRequest("Metrics list is empty.");

            foreach (var dto in metrics)
            {
                if (string.IsNullOrWhiteSpace(dto.Site))
                    return BadRequest("Site is required.");

                if (dto.Month < 1 || dto.Month > 12)
                    return BadRequest("Month must be 1..12.");

                // Always force FK from route
                dto.OtnOp1Id = id;

                var site = dto.Site.Trim();

                var existing = await _db.OtnOp1Metrics
                    .FirstOrDefaultAsync(m =>
                        m.OtnOp1Id == id &&
                        m.Site == site &&
                        m.Year == dto.Year &&
                        m.Month == dto.Month);

                if (existing == null)
                {
                    _db.OtnOp1Metrics.Add(new OtnOp1Metrics
                    {
                        OtnOp1Id = id,
                        Site = site,
                        UnavailableMinutes = dto.UnavailableMinutes,
                        TotalMinutes = dto.TotalMinutes,
                        TotalNodes = dto.TotalNodes,
                        Year = dto.Year,
                        Month = dto.Month
                    });
                }
                else
                {
                    existing.UnavailableMinutes = dto.UnavailableMinutes;
                    existing.TotalMinutes = dto.TotalMinutes;
                    existing.TotalNodes = dto.TotalNodes;
                }
            }

            await _db.SaveChangesAsync();
            return Ok();
        }

        // DELETE: api/OtnOp1/metrics/123
        [HttpDelete("metrics/{metricId:int}")]
        public async Task<IActionResult> DeleteMetric(int metricId)
        {
            var row = await _db.OtnOp1Metrics.FirstOrDefaultAsync(x => x.Id == metricId);
            if (row == null) return NotFound();

            _db.OtnOp1Metrics.Remove(row);
            await _db.SaveChangesAsync();
            return NoContent();
        }
    }
}
