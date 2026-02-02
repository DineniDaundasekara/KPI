using backend.Data;
using backend.DTOs;
using backend.Models;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace backend.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class OtnOp2Controller : ControllerBase
    {
        private readonly AppDbContext _db;

        public OtnOp2Controller(AppDbContext db)
        {
            _db = db;
        }

        // GET: api/OtnOp2
        [HttpGet]
        public async Task<ActionResult<IEnumerable<OtnOp2Dto>>> GetAll()
        {
            var items = await _db.OtnOp2
                .AsNoTracking()
                .OrderBy(x => x.Id)
                .Select(x => new OtnOp2Dto
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

        // GET: api/OtnOp2/5
        [HttpGet("{id:int}")]
        public async Task<ActionResult<OtnOp2Dto>> GetById(int id)
        {
            var item = await _db.OtnOp2
                .AsNoTracking()
                .Where(x => x.Id == id)
                .Select(x => new OtnOp2Dto
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

        // POST: api/OtnOp2
        [HttpPost]
        public async Task<ActionResult<OtnOp2Dto>> Create([FromBody] CreateOtnOp2Dto dto)
        {
            if (string.IsNullOrWhiteSpace(dto.NetworkEngineerKpi))
                return BadRequest("NetworkEngineerKpi is required.");

            var entity = new OtnOp2
            {
                NetworkEngineerKpi = dto.NetworkEngineerKpi.Trim(),
                Division = dto.Division,
                Section = dto.Section,
                KpiPercent = dto.KpiPercent
            };

            _db.OtnOp2.Add(entity);
            await _db.SaveChangesAsync();

            var result = new OtnOp2Dto
            {
                Id = entity.Id,
                NetworkEngineerKpi = entity.NetworkEngineerKpi,
                Division = entity.Division,
                Section = entity.Section,
                KpiPercent = entity.KpiPercent
            };

            return CreatedAtAction(nameof(GetById), new { id = entity.Id }, result);
        }

        // PUT: api/OtnOp2/5
        [HttpPut("{id:int}")]
        public async Task<IActionResult> Update(int id, [FromBody] CreateOtnOp2Dto dto)
        {
            var entity = await _db.OtnOp2.FirstOrDefaultAsync(x => x.Id == id);
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

        // DELETE: api/OtnOp2/5
        [HttpDelete("{id:int}")]
        public async Task<IActionResult> Delete(int id)
        {
            var entity = await _db.OtnOp2.FirstOrDefaultAsync(x => x.Id == id);
            if (entity == null) return NotFound();

            _db.OtnOp2.Remove(entity);
            await _db.SaveChangesAsync();
            return NoContent();
        }

        // GET: api/OtnOp2/5/metrics?year=2026&month=1
        [HttpGet("{id:int}/metrics")]
        public async Task<ActionResult<IEnumerable<OtnOp2MetricDto>>> GetMetrics(
            int id,
            [FromQuery] short year,
            [FromQuery] byte month)
        {
            var exists = await _db.OtnOp2.AsNoTracking().AnyAsync(x => x.Id == id);
            if (!exists) return NotFound("KPI not found.");

            var rows = await _db.OtnOp2Metrics
                .AsNoTracking()
                .Where(m => m.OtnOp2Id == id && m.Year == year && m.Month == month)
                .OrderBy(m => m.Site)
                .Select(m => new OtnOp2MetricDto
                {
                    Id = m.Id,
                    OtnOp2Id = m.OtnOp2Id,
                    Site = m.Site,
                    TotalFailedLinks = m.TotalFailedLinks,
                    LinksSlaNotViolated = m.LinksSlaNotViolated,
                    Year = m.Year,
                    Month = m.Month
                })
                .ToListAsync();

            return Ok(rows);
        }

        // POST: api/OtnOp2/5/metrics
        [HttpPost("{id:int}/metrics")]
        public async Task<IActionResult> UpsertMetrics(int id, [FromBody] List<OtnOp2MetricDto> metrics)
        {
            var exists = await _db.OtnOp2.AnyAsync(x => x.Id == id);
            if (!exists) return NotFound("KPI not found.");

            if (metrics == null || metrics.Count == 0)
                return BadRequest("Metrics list is empty.");

            foreach (var dto in metrics)
            {
                if (string.IsNullOrWhiteSpace(dto.Site))
                    return BadRequest("Site is required.");

                if (dto.Month < 1 || dto.Month > 12)
                    return BadRequest("Month must be 1..12.");

                dto.OtnOp2Id = id;
                var site = dto.Site.Trim();

                var existing = await _db.OtnOp2Metrics
                    .FirstOrDefaultAsync(m =>
                        m.OtnOp2Id == id &&
                        m.Site == site &&
                        m.Year == dto.Year &&
                        m.Month == dto.Month);

                if (existing == null)
                {
                    _db.OtnOp2Metrics.Add(new OtnOp2Metrics
                    {
                        OtnOp2Id = id,
                        Site = site,
                        TotalFailedLinks = dto.TotalFailedLinks,
                        LinksSlaNotViolated = dto.LinksSlaNotViolated,
                        Year = dto.Year,
                        Month = dto.Month
                    });
                }
                else
                {
                    existing.TotalFailedLinks = dto.TotalFailedLinks;
                    existing.LinksSlaNotViolated = dto.LinksSlaNotViolated;
                }
            }

            await _db.SaveChangesAsync();
            return Ok();
        }

        // DELETE: api/OtnOp2/metrics/123
        [HttpDelete("metrics/{metricId:int}")]
        public async Task<IActionResult> DeleteMetric(int metricId)
        {
            var row = await _db.OtnOp2Metrics.FirstOrDefaultAsync(x => x.Id == metricId);
            if (row == null) return NotFound();

            _db.OtnOp2Metrics.Remove(row);
            await _db.SaveChangesAsync();
            return NoContent();
        }
    }
}
