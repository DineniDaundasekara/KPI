using backend.Data;
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

        [HttpGet]
        public async Task<ActionResult<IEnumerable<Form9_2025>>> GetAll()
        {
            return await _context.Form9_2025
                .OrderBy(x => x.No)
                .ToListAsync();
        }

        [HttpGet("{id}")]
        public async Task<ActionResult<Form9_2025>> GetById(string id)
        {
            var record = await _context.Form9_2025.FindAsync(id);
            if (record == null) return NotFound();
            return record;
        }

        [HttpPost]
        public async Task<ActionResult<Form9_2025>> Create(Form9_2025 model)
        {
            _context.Form9_2025.Add(model);
            await _context.SaveChangesAsync();

            return CreatedAtAction(nameof(GetById), new { id = model.Id }, model);
        }

        [HttpPut("{id}")]
        public async Task<IActionResult> Update(string id, Form9_2025 model)
        {
            if (id != model.Id) return BadRequest();

            _context.Entry(model).State = EntityState.Modified;
            await _context.SaveChangesAsync();

            return NoContent();
        }

        [HttpDelete("{id}")]
        public async Task<IActionResult> Delete(string id)
        {
            var record = await _context.Form9_2025.FindAsync(id);
            if (record == null) return NotFound();

            _context.Form9_2025.Remove(record);
            await _context.SaveChangesAsync();
            return NoContent();
        }
    }
}
