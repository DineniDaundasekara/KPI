using backend.Data;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

using backend.Models;

namespace backend.Controllers
{
    [ApiController]
    [Route("form7")]
    public class Form7Controller : ControllerBase
    {
        private readonly AppDbContext _context;

        public Form7Controller(AppDbContext context)
        {
            _context = context;
        }

        // GET /form7/
        [HttpGet]
        public async Task<IActionResult> GetAll()
        {
            var data = await _context.Form7
                .OrderBy(x => x.No)
                .ToListAsync();

            return Ok(data);
        }

        // POST /form7/add
        [HttpPost("add")]
        public async Task<IActionResult> Add(Form7_2025 model)
        {
            _context.Form7.Add(model);
            await _context.SaveChangesAsync();
            return Ok(model);
        }

        // PUT /form7/update/{id}
        [HttpPut("update/{id}")]
        public async Task<IActionResult> Update(int id, Form7_2025 model)
        {
            var record = await _context.Form7.FindAsync(id);
            if (record == null) return NotFound();

            record.No = model.No;
            record.NetworkEngineerKpi = model.NetworkEngineerKpi;
            record.Division = model.Division;
            record.Section = model.Section;
            record.KpiPercent = model.KpiPercent;

            await _context.SaveChangesAsync();
            return Ok(record);
        }

        // DELETE /form7/delete/{id}
        [HttpDelete("delete/{id}")]
        public async Task<IActionResult> Delete(int id)
        {
            var record = await _context.Form7.FindAsync(id);
            if (record == null) return NotFound();

            _context.Form7.Remove(record);
            await _context.SaveChangesAsync();
            return Ok();
        }
    }
}
