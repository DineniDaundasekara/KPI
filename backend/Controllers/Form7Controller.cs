using backend.Data;
using backend.DTOs;
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

        // =========================
        // GET ALL
        // =========================
        [HttpGet]
        public async Task<IActionResult> GetAll()
        {
            var data = await _context.Form7_2025
                .OrderBy(x => x.No)
                .ToListAsync();

            return Ok(data);
        }

        // =========================
        // ADD
        // =========================
        [HttpPost("add")]
        public async Task<IActionResult> Add([FromBody] Form7Dto dto)
        {
            var entity = new Form7_2025
            {
                Id = Guid.NewGuid().ToString(),
                No = dto.No,
                NetworkEngineerKpi = dto.NetworkEngineerKpi,
                Division = dto.Division,
                Section = dto.Section,
                KpiPercent = dto.KpiPercent,

                // 🔴 REQUIRED VALUES
                UnavailableMinutes = dto.UnavailableMinutes,
                TotalMinutes = dto.TotalMinutes,
                TotalNodes = dto.TotalNodes,

                Month = (byte)dto.Month,
                Year = (short)dto.Year,
                UpdatedAt = DateTime.UtcNow.ToString("yyyy-MM-dd HH:mm:ss")
            };

            _context.Form7_2025.Add(entity);
            await _context.SaveChangesAsync();

            return Ok(entity);
        }

        // =========================
        // UPDATE
        // =========================
        [HttpPut("update/{id}")]
        public async Task<IActionResult> Update(string id, [FromBody] Form7Dto dto)
        {
            var entity = await _context.Form7_2025.FirstOrDefaultAsync(x => x.Id == id);
            if (entity == null)
                return NotFound();

            entity.No = dto.No;
            entity.NetworkEngineerKpi = dto.NetworkEngineerKpi;
            entity.Division = dto.Division;
            entity.Section = dto.Section;
            entity.KpiPercent = dto.KpiPercent;
            entity.UnavailableMinutes = dto.UnavailableMinutes;
            entity.TotalMinutes = dto.TotalMinutes;
            entity.TotalNodes = dto.TotalNodes;
            entity.Month = (byte)dto.Month;
            entity.Year = (short)dto.Year;
            entity.UpdatedAt = DateTime.UtcNow.ToString("yyyy-MM-dd HH:mm:ss");

            await _context.SaveChangesAsync();

            return Ok(entity);
        }

        // =========================
        // DELETE
        // =========================
        [HttpDelete("delete/{id}")]
        public async Task<IActionResult> Delete(string id)
        {
            var entity = await _context.Form7_2025.FirstOrDefaultAsync(x => x.Id == id);
            if (entity == null)
                return NotFound();

            _context.Form7_2025.Remove(entity);
            await _context.SaveChangesAsync();

            return Ok();
        }
    }
}