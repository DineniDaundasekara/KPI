using backend.Data;
using backend.DTOs;
using backend.Models;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace backend.Controllers
{
    [ApiController]
    [Route("form9")]
    public class Form9Controller : ControllerBase
    {
        private readonly AppDbContext _context;

        public Form9Controller(AppDbContext context)
        {
            _context = context;
        }

        // GET /form9
        [HttpGet]
        public async Task<IActionResult> GetAll()
        {
            var data = await _context.Form9_2025
                .AsNoTracking()
                .OrderBy(x => x.No)
                .ToListAsync();

            return Ok(data);
        }

        // POST /form9/add
        [HttpPost("add")]
        public async Task<IActionResult> Add(Form9Dto dto)
        {
            var record = new Form9_2025
            {
                Id = Guid.NewGuid().ToString(),
                No = dto.No,
                Network_Engineer_Kpi = dto.Network_Engineer_Kpi,
                Division = dto.Division,
                Section = dto.Section,
                Kpi_Percent = dto.Kpi_Percent,
                Month = dto.Month == 0 ? (byte)DateTime.Now.Month : dto.Month,
                Year = dto.Year == 0 ? (short)DateTime.Now.Year : dto.Year,
                UpdatedAt = DateTime.Now.ToString("yyyy-MM-dd HH:mm:ss"),
                v = dto.v
            };

            _context.Form9_2025.Add(record);
            await _context.SaveChangesAsync();

            return Ok(record);
        }

        // PUT /form9/update/{id}
        [HttpPut("update/{id}")]
        public async Task<IActionResult> Update(string id, Form9Dto dto)
        {
            var record = await _context.Form9_2025.FindAsync(id);
            if (record == null) return NotFound();

            record.No = dto.No;
            record.Network_Engineer_Kpi = dto.Network_Engineer_Kpi;
            record.Division = dto.Division;
            record.Section = dto.Section;
            record.Kpi_Percent = dto.Kpi_Percent;
            record.Month = dto.Month == 0 ? record.Month : dto.Month;
            record.Year = dto.Year == 0 ? record.Year : dto.Year;
            record.UpdatedAt = DateTime.Now.ToString("yyyy-MM-dd HH:mm:ss");
            record.v = dto.v;

            await _context.SaveChangesAsync();
            return Ok(record);
        }

        // DELETE /form9/delete/{id}
        [HttpDelete("delete/{id}")]
        public async Task<IActionResult> Delete(string id)
        {
            var record = await _context.Form9_2025.FindAsync(id);
            if (record == null) return NotFound();

            _context.Form9_2025.Remove(record);
            await _context.SaveChangesAsync();
            return Ok();
        }
    }
}
