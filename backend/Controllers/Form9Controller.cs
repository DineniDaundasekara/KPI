using backend.Data;
using backend.DTOs;
using backend.Models;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace backend.Controllers
{
    [ApiController]
    [Route("api/kpi")]
    public class Form9Controller : ControllerBase
    {
        private readonly AppDbContext _context;

        public Form9Controller(AppDbContext context)
        {
            _context = context;
        }

        // ============================
        // GET: api/kpi
        // ============================
        [HttpGet]
        public async Task<ActionResult<IEnumerable<Form9Dto>>> GetAll()
        {
            var data = await _context.Form9_2025
                .OrderBy(x => x.No)
                .Select(x => new Form9Dto
                {
                    Id = x.Id,
                    No = x.No,
                    Network_Engineer_Kpi = x.Network_Engineer_Kpi,
                    Division = x.Division,
                    Section = x.Section,
                    Kpi_Percent = (float)x.Kpi_Percent,
                    Month = x.Month,
                    Year = x.Year
                })
                .ToListAsync();

            return Ok(data);
        }

        // ============================
        // POST: api/kpi
        // ============================
        [HttpPost]
        public async Task<IActionResult> Create([FromBody] Form9Dto dto)
        {
            if (!ModelState.IsValid)
                return BadRequest(ModelState);

            var entity = new Form9_2025
            {
                No = dto.No,
                Network_Engineer_Kpi = dto.Network_Engineer_Kpi,
                Division = dto.Division,
                Section = dto.Section,
                Kpi_Percent = dto.Kpi_Percent,

                // ✅ FIX: Default Month & Year if frontend does not send
                Month = dto.Month == 0 ? (byte)DateTime.Now.Month : dto.Month,
                Year = dto.Year == 0 ? (short)DateTime.Now.Year : dto.Year,

                V = 1
            };

            _context.Form9_2025.Add(entity);
            await _context.SaveChangesAsync();

            dto.Id = entity.Id;
            dto.Month = entity.Month;
            dto.Year = entity.Year;

            return Ok(dto);
        }

        // ============================
        // PUT: api/kpi/{id}
        // ============================
        [HttpPut("{id}")]
        public async Task<IActionResult> Update(string id, [FromBody] Form9Dto dto)
        {
            if (!ModelState.IsValid)
                return BadRequest(ModelState);

            var entity = await _context.Form9_2025.FindAsync(id);
            if (entity == null)
                return NotFound($"KPI record with ID {id} not found");

            entity.No = dto.No;
            entity.Network_Engineer_Kpi = dto.Network_Engineer_Kpi;
            entity.Division = dto.Division;
            entity.Section = dto.Section;
            entity.Kpi_Percent = dto.Kpi_Percent;

            // ✅ Keep existing Month/Year if not sent
            entity.Month = dto.Month == 0 ? entity.Month : dto.Month;
            entity.Year = dto.Year == 0 ? entity.Year : dto.Year;

            await _context.SaveChangesAsync();

            return NoContent();
        }

        // ============================
        // DELETE: api/kpi/{id}
        // ============================
        [HttpDelete("{id}")]
        public async Task<IActionResult> Delete(string id)
        {
            var entity = await _context.Form9_2025.FindAsync(id);
            if (entity == null)
                return NotFound($"KPI record with ID {id} not found");

            _context.Form9_2025.Remove(entity);
            await _context.SaveChangesAsync();

            return NoContent();
        }
    }
}
