using backend.Data;
using backend.DTOs;
using backend.Models;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace backend.Controllers
{
    [ApiController]
    [Route("form6")]
    public class IpNwOpKpiController : ControllerBase
    {
        private readonly AppDbContext _db;

        public IpNwOpKpiController(AppDbContext db)
        {
            _db = db;
        }

        // GET: /form6
        [HttpGet("")]
        public async Task<IActionResult> GetAll()
        {
            var rows = await _db.IpNwOpKpis
                .OrderBy(x => x.No)
                .Select(x => new IpNwOpKpiDto
                {
                    _id = x.Id,
                    no = x.No,
                    network_engineer_kpi = x.NetworkEngineerKpi,
                    division = x.Division,
                    section = x.Section,
                    kpi_percent = x.KpiPercent
                })
                .ToListAsync();

            return Ok(rows);
        }

        // POST: /form6/add
        [HttpPost("add")]
        public async Task<IActionResult> Add([FromBody] IpNwOpKpiDto dto)
        {
            var entity = new IpNwOpKpi
            {
                Id = Guid.NewGuid().ToString("N"),
                No = (short)dto.no, // safe cast
                NetworkEngineerKpi = dto.network_engineer_kpi,
                Division = dto.division,
                Section = dto.section,
                KpiPercent = dto.kpi_percent
            };

            _db.IpNwOpKpis.Add(entity);
            await _db.SaveChangesAsync();

            return Ok(new { message = "Created" });
        }

        // PUT: /form6/update/{id}
        [HttpPut("update/{id}")]
        public async Task<IActionResult> Update(string id, [FromBody] IpNwOpKpiDto dto)
        {
            var entity = await _db.IpNwOpKpis.FirstOrDefaultAsync(x => x.Id == id);
            if (entity == null) return NotFound();

            entity.No = (short)dto.no;
            entity.NetworkEngineerKpi = dto.network_engineer_kpi;
            entity.Division = dto.division;
            entity.Section = dto.section;
            entity.KpiPercent = dto.kpi_percent;

            await _db.SaveChangesAsync();
            return Ok(new { message = "Updated" });
        }

        // DELETE: /form6/delete/{id}
        [HttpDelete("delete/{id}")]
        public async Task<IActionResult> Delete(string id)
        {
            var entity = await _db.IpNwOpKpis.FirstOrDefaultAsync(x => x.Id == id);
            if (entity == null) return NotFound();

            _db.IpNwOpKpis.Remove(entity);
            await _db.SaveChangesAsync();

            return Ok(new { message = "Deleted" });
        }
    }
}
