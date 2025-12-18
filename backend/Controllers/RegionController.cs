using backend.Data;
using backend.DTOs;
using backend.Models;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace backend.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class RegionController : ControllerBase
    {
        private readonly AppDbContext _context;

        public RegionController(AppDbContext context)
        {
            _context = context;
        }

        // GET: api/region
        [HttpGet]
        public async Task<ActionResult<IEnumerable<RegionDto>>> GetAll()
        {
            var items = await _context.Regions.AsNoTracking()
                .OrderBy(x => x.Region)
                .Select(x => new RegionDto
                {
                    Id = x.Id,
                    Region = x.Region,
                    Province = x.Province,
                    NetworkEngineer = x.NetworkEngineer,
                    Lea = x.Lea,
                    CreatedAt = x.CreatedAt ?? DateTime.MinValue,  // Handle nullable DateTime
                    UpdatedAt = x.UpdatedAt ?? DateTime.MinValue   // Handle nullable DateTime
                })
                .ToListAsync();

            return Ok(items);
        }

        // GET: api/region/{id}
        [HttpGet("{id}")]
        public async Task<ActionResult<RegionDto>> GetById(string id)
        {
            var x = await _context.Regions.AsNoTracking().FirstOrDefaultAsync(r => r.Id == id);
            if (x == null) return NotFound();

            return Ok(new RegionDto
            {
                Id = x.Id,
                Region = x.Region,
                Province = x.Province,
                NetworkEngineer = x.NetworkEngineer,
                Lea = x.Lea,
                CreatedAt = x.CreatedAt ?? DateTime.MinValue,  // Handle nullable DateTime
                UpdatedAt = x.UpdatedAt ?? DateTime.MinValue   // Handle nullable DateTime
            });
        }

        // POST: api/region
        [HttpPost]
        public async Task<ActionResult<RegionDto>> Create([FromBody] CreateRegionDto dto)
        {
            var entity = new RegionData
            {
                Id = Guid.NewGuid().ToString(),
                Region = dto.Region,
                Province = dto.Province,
                NetworkEngineer = dto.NetworkEngineer,
                Lea = dto.Lea,
                CreatedAt = DateTime.UtcNow,
                UpdatedAt = DateTime.UtcNow
            };

            _context.Regions.Add(entity);
            await _context.SaveChangesAsync();

            return CreatedAtAction(nameof(GetById), new { id = entity.Id }, new RegionDto
            {
                Id = entity.Id,
                Region = entity.Region,
                Province = entity.Province,
                NetworkEngineer = entity.NetworkEngineer,
                Lea = entity.Lea,
                CreatedAt = entity.CreatedAt,
                UpdatedAt = entity.UpdatedAt
            });
        }

        // PUT: api/region/{id}
        [HttpPut("{id}")]
        public async Task<IActionResult> Update(string id, [FromBody] UpdateRegionDto dto)
        {
            var existing = await _context.Regions.FirstOrDefaultAsync(r => r.Id == id);
            if (existing == null) return NotFound();

            existing.Region = dto.Region;
            existing.Province = dto.Province;
            existing.NetworkEngineer = dto.NetworkEngineer;
            existing.Lea = dto.Lea;
            existing.UpdatedAt = DateTime.UtcNow;
            existing.__v++;

            await _context.SaveChangesAsync();
            return NoContent();
        }

        // DELETE: api/region/{id}
        [HttpDelete("{id}")]
        public async Task<IActionResult> Delete(string id)
        {
            var existing = await _context.Regions.FirstOrDefaultAsync(r => r.Id == id);
            if (existing == null) return NotFound();

            // Accessing and removing the region
            _context.Regions.Remove(existing);
            await _context.SaveChangesAsync();

            return NoContent();
        }
    }
}
