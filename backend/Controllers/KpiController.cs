using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using backend.Data;
using backend.Models;
using backend.DTOs;

namespace backend.Controllers
{
    [ApiController]
    [Route("api/kpis")]
    public class KpiController : ControllerBase
    {
        private readonly AppDbContext _context;

        public KpiController(AppDbContext context)
        {
            _context = context;
        }

        // GET: api/kpis
        [HttpGet]
        public async Task<IActionResult> GetAll([FromQuery] int? year, [FromQuery] int? month)
        {
            var q = _context.ServiceFulfilmentKpis.AsNoTracking();

            if (year.HasValue) q = q.Where(x => x.Year == year.Value);
            if (month.HasValue) q = q.Where(x => x.Month == month.Value);

            var list = await q
                .OrderByDescending(x => x.UpdatedAt)
                .ToListAsync();

            return Ok(list);
        }

        // GET: api/kpis/5
        [HttpGet("{id:int}")]
        public async Task<IActionResult> GetById(int id)
        {
            var item = await _context.ServiceFulfilmentKpis.AsNoTracking()
                .FirstOrDefaultAsync(x => x.Id == id);

            return item == null ? NotFound() : Ok(item);
        }

        // POST: api/kpis
        [HttpPost]
        public async Task<IActionResult> Create([FromBody] ServiceFulfilmentKpiDto dto)
        {
            if (!ModelState.IsValid) return BadRequest(ModelState);

            var entity = new ServiceFulfilmentKpi
            {
                No = dto.No,
                Kpi = dto.Kpi,
                Target = dto.Target,
                Calculation = dto.Calculation,
                Platform = dto.Platform,
                ResponsibleDgm = dto.ResponsibleDgm,
                DefinedOlaDetails = dto.DefinedOlaDetails,
                Weightage = dto.Weightage,
                DataSources = dto.DataSources,
                Year = dto.Year,
                Month = dto.Month,
                UpdatedAt = DateTime.UtcNow
            };

            _context.ServiceFulfilmentKpis.Add(entity);
            await _context.SaveChangesAsync();

            return CreatedAtAction(nameof(GetById), new { id = entity.Id }, entity);
        }

        // PUT: api/kpis/5
        [HttpPut("{id:int}")]
        public async Task<IActionResult> Update(int id, [FromBody] ServiceFulfilmentKpiDto dto)
        {
            var entity = await _context.ServiceFulfilmentKpis.FirstOrDefaultAsync(x => x.Id == id);
            if (entity == null) return NotFound();

            entity.No = dto.No;
            entity.Kpi = dto.Kpi;
            entity.Target = dto.Target;
            entity.Calculation = dto.Calculation;
            entity.Platform = dto.Platform;
            entity.ResponsibleDgm = dto.ResponsibleDgm;
            entity.DefinedOlaDetails = dto.DefinedOlaDetails;
            entity.Weightage = dto.Weightage;
            entity.DataSources = dto.DataSources;
            entity.Year = dto.Year;
            entity.Month = dto.Month;
            entity.UpdatedAt = DateTime.UtcNow;

            await _context.SaveChangesAsync();
            return NoContent();
        }

        // DELETE: api/kpis/5
        [HttpDelete("{id:int}")]
        public async Task<IActionResult> Delete(int id)
        {
            var entity = await _context.ServiceFulfilmentKpis.FirstOrDefaultAsync(x => x.Id == id);
            if (entity == null) return NotFound();

            _context.ServiceFulfilmentKpis.Remove(entity);
            await _context.SaveChangesAsync();
            return NoContent();
        }

        // GET: api/kpis/stats
        [HttpGet("stats")]
        public async Task<IActionResult> Stats()
        {
            var list = await _context.ServiceFulfilmentKpis.AsNoTracking().ToListAsync();

            var activeKpis = list.Count;
            var avgWeightage = activeKpis == 0 ? 0 : Math.Round(list.Average(x => x.Weightage), 1);
            var dgmCount = list.Select(x => x.ResponsibleDgm).Where(x => !string.IsNullOrWhiteSpace(x)).Distinct().Count();

            // You can compute real "targetsMet" later from region columns, etc.
            var targetsMet = 0;

            return Ok(new { activeKpis, targetsMet, avgWeightage, dgmCount });
        }
    }
}
