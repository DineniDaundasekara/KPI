﻿using backend.Data;
using backend.DTOs;
using backend.Models;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace backend.Controllers
{
    [ApiController]
    [Route("api/mtnc-routine")]
    public class MtncRoutineController : ControllerBase
    {
        private readonly AppDbContext _db;

        public MtncRoutineController(AppDbContext db)
        {
            _db = db;
        }

        // GET: /api/mtnc-routine
        [HttpGet]
        public async Task<IActionResult> GetAll()
        {
            var list = await _db.MtncRoutines
                .AsNoTracking()
                .OrderBy(x => x.No)
                .Select(x => new
                {
                    _id = x.Id,  // ✅ keep _id to match your frontend currently
                    no = x.No,
                    kpi = x.Kpi,
                    target = x.Target,
                    calculation = x.Calculation,
                    platform = x.Platform,
                    responsibleDGM = x.ResponsibleDGM,
                    definedOLADetails = x.DefinedOLADetails,
                    dataSources = x.DataSources
                })
                .ToListAsync();

            return Ok(list);
        }

        // POST: /api/mtnc-routine/add
        [HttpPost("add")]
        public async Task<IActionResult> Add([FromBody] MtncRoutineDto dto)
        {
            if (!ModelState.IsValid) return BadRequest(ModelState);

            var entity = new MtncRoutine
            {
                Id = Guid.NewGuid().ToString("N"),
                No = dto.No,
                Kpi = dto.Kpi.Trim(),
                Target = dto.Target.Trim(),
                Calculation = dto.Calculation.Trim(),
                Platform = dto.Platform.Trim(),
                ResponsibleDGM = dto.ResponsibleDGM.Trim(),
                DefinedOLADetails = dto.DefinedOLADetails.Trim(),
                DataSources = dto.DataSources.Trim(),
                CreatedAt = DateTime.UtcNow.ToString("yyyy-MM-ddTHH:mm:ss.fffZ"),
                UpdatedAt = DateTime.UtcNow.ToString("yyyy-MM-ddTHH:mm:ss.fffZ"),
                V = 0
            };

            _db.MtncRoutines.Add(entity);
            await _db.SaveChangesAsync();

            return Ok(new { _id = entity.Id });
        }

        // PUT: /api/mtnc-routine/update/{id}
        [HttpPut("update/{id}")]
        public async Task<IActionResult> Update(string id, [FromBody] MtncRoutineDto dto)
        {
            if (!ModelState.IsValid) return BadRequest(ModelState);

            var entity = await _db.MtncRoutines.FirstOrDefaultAsync(x => x.Id == id);
            if (entity == null) return NotFound(new { message = "KPI not found." });

            entity.No = dto.No;
            entity.Kpi = dto.Kpi.Trim();
            entity.Target = dto.Target.Trim();
            entity.Calculation = dto.Calculation.Trim();
            entity.Platform = dto.Platform.Trim();
            entity.ResponsibleDGM = dto.ResponsibleDGM.Trim();
            entity.DefinedOLADetails = dto.DefinedOLADetails.Trim();
            entity.DataSources = dto.DataSources.Trim();
            entity.UpdatedAt = DateTime.UtcNow.ToString("yyyy-MM-ddTHH:mm:ss.fffZ");
            entity.V = (byte)(entity.V + 1);

            await _db.SaveChangesAsync();
            return Ok(new { _id = entity.Id });
        }

        // DELETE: /api/mtnc-routine/delete/{id}
        [HttpDelete("delete/{id}")]
        public async Task<IActionResult> Delete(string id)
        {
            var entity = await _db.MtncRoutines.FirstOrDefaultAsync(x => x.Id == id);
            if (entity == null) return NotFound(new { message = "KPI not found." });

            _db.MtncRoutines.Remove(entity);
            await _db.SaveChangesAsync();

            return NoContent();
        }
    }
}
