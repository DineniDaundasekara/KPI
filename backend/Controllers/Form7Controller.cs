using backend.Data;
using backend.Models;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace backend.Controllers
{
    [ApiController]
    [Route("api/form7")]
    public class Form7Controller : ControllerBase
    {
        private readonly AppDbContext _context;

        public Form7Controller(AppDbContext context)
        {
            _context = context;
        }

        [HttpGet]
        public async Task<IActionResult> GetAll()
        {
            return Ok(await _context.Form7.OrderBy(x => x.No).ToListAsync());
        }

        [HttpPost]
        public async Task<IActionResult> Add(Form7_2025 model)
        {
            _context.Form7.Add(model);
            await _context.SaveChangesAsync();
            return Ok(model);
        }

        [HttpPut("{id}")]
        public async Task<IActionResult> Update(string id, Form7_2025 model)
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

        [HttpDelete("{id}")]
        public async Task<IActionResult> Delete(string id)
        {
            var record = await _context.Form7.FindAsync(id);
            if (record == null) return NotFound();

            _context.Form7.Remove(record);
            await _context.SaveChangesAsync();
            return Ok();
        }
    }
}
