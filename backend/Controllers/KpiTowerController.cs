using backend.Data;
using backend.Dtos;
using backend.Helpers;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace backend.Controllers
{
    [ApiController]
    [Route("api/kpi-tower")]
    public class KpiTowerController : ControllerBase
    {
        private readonly AppDbContext _db;

        public KpiTowerController(AppDbContext db) => _db = db;

        // GET /api/kpi-tower?month=11&year=2025
        [HttpGet]
        public async Task<IActionResult> GetAll([FromQuery] int? month, [FromQuery] int? year)
        {
            var query = _db.TowerKpis.AsNoTracking().AsQueryable();

            if (month.HasValue) query = query.Where(x => x.Month == month.Value);
            if (year.HasValue) query = query.Where(x => x.Year == year.Value);

            var data = await query.OrderBy(x => x.No).ToListAsync();

            // Convert DateTime to string in the format "yyyy-MM-ddTHH:mm:ss.fff"
            var result = data.Select(x => new
            {
                _id = x.Id,
                no = (byte)x.No,  // Explicit cast to byte
                responsibility = x.Responsibility,
                frequency = x.Frequency,
                weightage = x.Weightage,
                kpi = x.Kpi,
                createdAt = x.CreatedAt.ToString("yyyy-MM-ddTHH:mm:ss.fff"),
                updatedAt = x.UpdatedAt.ToString("yyyy-MM-ddTHH:mm:ss.fff"),
                v = (byte)x.V,  // Explicit cast to byte
                month = (byte)x.Month,  // Explicit cast to byte
                year = (short)x.Year  // Explicit cast to short
            });

            return Ok(result);
        }

        // POST /api/kpi-tower/add
        [HttpPost("add")]
        public async Task<IActionResult> Add([FromBody] TowerKpiCreateDto dto)
        {
            if (!ModelState.IsValid) return BadRequest(ModelState);

            var now = DateTime.UtcNow;
            var m = (byte)(dto.Month ?? DateTime.UtcNow.Month); // Explicit cast to byte
            var y = (short)(dto.Year ?? DateTime.UtcNow.Year); // Explicit cast to short

            var entity = new backend.Models.TowerKpi
            {
                Id = ObjectIdLike.NewId24(),
                No = (byte)dto.No, // Explicit cast to byte
                Responsibility = dto.Responsibility,
                Frequency = dto.Frequency,
                Weightage = dto.Weightage,
                Kpi = dto.Kpi,
                Month = m,
                Year = y,
                CreatedAt = now,  // Store DateTime directly
                UpdatedAt = now,  // Store DateTime directly
                V = 0
            };

            _db.TowerKpis.Add(entity);
            await _db.SaveChangesAsync();

            return Created("", new
            {
                _id = entity.Id,
                no = entity.No,
                responsibility = entity.Responsibility,
                frequency = entity.Frequency,
                weightage = entity.Weightage,
                kpi = entity.Kpi
            });
        }

        // PUT /api/kpi-tower/update/{id}
        [HttpPut("update/{id}")]
        public async Task<IActionResult> Update(string id, [FromBody] TowerKpiUpdateDto dto)
        {
            if (!ModelState.IsValid) return BadRequest(ModelState);

            var entity = await _db.TowerKpis.FirstOrDefaultAsync(x => x.Id == id);
            if (entity == null) return NotFound(new { message = "Record not found." });

            entity.No = (byte)dto.No; // Explicit cast to byte
            entity.Responsibility = dto.Responsibility;
            entity.Frequency = dto.Frequency;
            entity.Weightage = dto.Weightage;
            entity.Kpi = dto.Kpi;
            entity.Month = (byte)(dto.Month ?? entity.Month);  // Explicit cast to byte
            entity.Year = (short)(dto.Year ?? entity.Year);  // Explicit cast to short
            entity.UpdatedAt = DateTime.UtcNow;  // Update DateTime directly

            await _db.SaveChangesAsync();
            return Ok(new { message = "Updated successfully." });
        }

        // DELETE /api/kpi-tower/delete/{id}
        [HttpDelete("delete/{id}")]
        public async Task<IActionResult> Delete(string id)
        {
            var entity = await _db.TowerKpis.FirstOrDefaultAsync(x => x.Id == id);
            if (entity == null) return NotFound(new { message = "Record not found." });

            _db.TowerKpis.Remove(entity);
            await _db.SaveChangesAsync();
            return Ok(new { message = "Deleted successfully." });
        }
    }
}
