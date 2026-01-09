using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using backend.Data;
using backend.DTOs;
using backend.Models;

namespace backend.Controllers
{
    [ApiController]
    [Route("form4")]
    public class Form4Controller : ControllerBase
    {
        private readonly AppDbContext _context;

        public Form4Controller(AppDbContext context)
        {
            _context = context;
        }

        // =========================
        // GET ALL
        // =========================
        [HttpGet]
        public async Task<IActionResult> GetAll()
        {
            var data = await _context.Form4_2025
                .OrderBy(x => x.No)
                .ToListAsync();

            return Ok(data);
        }

        // =========================
        // ADD
        // =========================
        [HttpPost("add")]
        public async Task<IActionResult> Add([FromBody] ServiceFulfilmentKpiDto dto)
        {
            var entity = new Form4_2025
            {
                Id = Guid.NewGuid().ToString(),
                No = dto.No,
                Kpi = dto.Kpi,
                Target = dto.Target,
                Calculation = dto.Calculation,
                Platform = dto.Platform,
                ResponsibleDgm = dto.ResponsibleDgm,
                DefineDoladetails = dto.DefineDoladetails,
                Weightage = dto.Weightage,
                DataSources = dto.DataSources,
                Month = (byte)dto.Month,
                Year = (short)dto.Year,
                UpdatedAt = DateTime.UtcNow.ToString("yyyy-MM-dd HH:mm:ss")
            };

            _context.Form4_2025.Add(entity);
            await _context.SaveChangesAsync();

            return Ok(entity);
        }

        // =========================
        // UPDATE
        // =========================
        [HttpPut("update/{id}")]
        public async Task<IActionResult> Update(string id, [FromBody] ServiceFulfilmentKpiDto dto)
        {
            var entity = await _context.Form4_2025.FirstOrDefaultAsync(x => x.Id == id);
            if (entity == null)
                return NotFound();

            entity.No = dto.No;
            entity.Kpi = dto.Kpi;
            entity.Target = dto.Target;
            entity.Calculation = dto.Calculation;
            entity.Platform = dto.Platform;
            entity.ResponsibleDgm = dto.ResponsibleDgm;
            entity.DefineDoladetails = dto.DefineDoladetails;
            entity.Weightage = dto.Weightage;
            entity.DataSources = dto.DataSources;
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
            var entity = await _context.Form4_2025.FirstOrDefaultAsync(x => x.Id == id);
            if (entity == null)
                return NotFound();

            _context.Form4_2025.Remove(entity);
            await _context.SaveChangesAsync();

            return Ok();
        }
    }
}
