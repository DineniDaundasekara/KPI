using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using backend.Data;
using backend.Models;
using backend.DTOs;

namespace backend.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class TmActivityPlansController : ControllerBase
    {
        private readonly AppDbContext _context;

        public TmActivityPlansController(AppDbContext context)
        {
            _context = context;
        }

        // GET: api/TmActivityPlans
        [HttpGet]
        public async Task<IActionResult> GetAll()
        {
            var data = await _context.TmActivity1
                .AsNoTracking()
                .ToListAsync();

            return Ok(data);
        }

        // GET: api/TmActivityPlans/{id}
        [HttpGet("{id}")]
        public async Task<IActionResult> GetById(int id)
        {
            var row = await _context.TmActivity1.FindAsync(id);
            if (row == null) return NotFound();

            return Ok(row);
        }

        // POST: api/TmActivityPlans
        [HttpPost]
        public async Task<IActionResult> Create([FromBody] CreateTmActivityPlanDto dto)
        {
            if (!ModelState.IsValid)
                return BadRequest(ModelState);

            var now = DateTime.UtcNow.ToString("yyyy-MM-ddTHH:mm:ss.fffZ");

            var entity = new TmActivity1
            {
                No = byte.TryParse(dto.No, out var noVal) ? noVal : null,
                Kpi = dto.Kpi,
                Target = dto.Target,
                Calculation = dto.Calculation,
                Platform = dto.Platform,
                ResponsibleDGM = dto.ResponsibleDGM,
                DefinedOLADetails = dto.DefinedOLADetails,
                DataSources = dto.DataSources,
                CreatedAt = now,
                UpdatedAt = now,
                V = 0
            };

            _context.TmActivity1.Add(entity);
            await _context.SaveChangesAsync();

            return Ok(entity);
        }

        // PUT: api/TmActivityPlans/{id}
        [HttpPut("{id}")]
        public async Task<IActionResult> Update(int id, [FromBody] UpdateTmActivityPlanDto dto)
        {
            var entity = await _context.TmActivity1.FindAsync(id);
            if (entity == null) return NotFound();

            entity.No = byte.TryParse(dto.No, out var noVal) ? noVal : entity.No;
            entity.Kpi = dto.Kpi;
            entity.Target = dto.Target;
            entity.Calculation = dto.Calculation;
            entity.Platform = dto.Platform;
            entity.ResponsibleDGM = dto.ResponsibleDGM;
            entity.DefinedOLADetails = dto.DefinedOLADetails;
            entity.DataSources = dto.DataSources;
            entity.UpdatedAt = DateTime.UtcNow.ToString("yyyy-MM-ddTHH:mm:ss.fffZ");

            await _context.SaveChangesAsync();
            return NoContent();
        }

        // DELETE: api/TmActivityPlans/{id}
        [HttpDelete("{id}")]
        public async Task<IActionResult> Delete(int id)
        {
            var entity = await _context.TmActivity1.FindAsync(id);
            if (entity == null) return NotFound();

            _context.TmActivity1.Remove(entity);
            await _context.SaveChangesAsync();

            return NoContent();
        }
    }
}