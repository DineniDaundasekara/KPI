using backend.Data;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using backend.Models;
using Microsoft.AspNetCore.Authorization;

namespace backend.Controllers
{
    [Route("api/regiondata")]
    [ApiController]
    [Authorize]
    public class RegionController : ControllerBase
    {
        private readonly AppDbContext _context;

        public RegionController(AppDbContext context)
        {
            _context = context;
        }

        // GET ALL
        [HttpGet]
        public async Task<IActionResult> GetAll()
        {
            return Ok(await _context.RegionData.ToListAsync());
        }

        // GET BY ID
        [HttpGet("{id}")]
        public async Task<IActionResult> GetById(int id)
        {
            var data = await _context.RegionData.FindAsync(id);
            if (data == null) return NotFound();
            return Ok(data);
        }

        // CREATE
        [HttpPost]
        [Authorize(Policy = "AdminOnly")]
        public async Task<IActionResult> Create(RegionData model)
        {
            _context.RegionData.Add(model);
            await _context.SaveChangesAsync();
            return Ok(model);
        }

        // UPDATE
        [HttpPut("{id}")]
        [Authorize(Policy = "AdminOnly")]
        public async Task<IActionResult> Update(int id, RegionData model)
        {
            if (id != model.Id) return BadRequest();

            _context.Entry(model).State = EntityState.Modified;
            await _context.SaveChangesAsync();
            return Ok(model);
        }

        // DELETE
        [HttpDelete("{id}")]
        [Authorize(Policy = "AdminOnly")]
        public async Task<IActionResult> Delete(int id)
        {
            var data = await _context.RegionData.FindAsync(id);
            if (data == null) return NotFound();

            _context.RegionData.Remove(data);
            await _context.SaveChangesAsync();
            return Ok();
        }
    }
}
