using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using backend.Data;
using backend.Models;
using backend.DTOs;

namespace backend.Controllers
{
    [ApiController]
    [Route("form8")]
    public class Form8Controller : ControllerBase
    {
        private readonly AppDbContext _context;

        public Form8Controller(AppDbContext context)
        {
            _context = context;
        }

        // GET /form8/
        [HttpGet]
        public async Task<IActionResult> GetAll()
        {
            var data = await _context.Form8Records
                 .AsNoTracking()   // 🔥 VERY IMPORTANT
                 .Take(100)        // 🔥 TEMP LIMIT

                .ToListAsync();
            return Ok(data);
        }

        // POST /form8/add
        [HttpPost("add")]
        public async Task<IActionResult> Add(Form8Dto dto)
        {
            var record = new Form8_2025
            {
                Id = Guid.NewGuid().ToString(),
                No = dto.No,
                Network_Engineer_Kpi = dto.Network_Engineer_Kpi,
                Division = dto.Division,
                Section = dto.Section,
                Kpi_Percent = dto.Kpi_Percent,

                // DEFAULT VALUES TO SATISFY DB
                Unavailable_Minutes_Id = Guid.NewGuid().ToString(),
                Total_Minutes_Id = Guid.NewGuid().ToString(),
                Total_Nodes_Id = Guid.NewGuid().ToString(),

                Month = (byte)DateTime.Now.Month,
                Year = (short)DateTime.Now.Year,
                UpdatedAt = DateTime.Now.ToString("yyyy-MM-dd HH:mm:ss")
            };

            _context.Form8Records.Add(record);
            await _context.SaveChangesAsync();

            return Ok(record);
        }

        // PUT /form8/update/{id}
        [HttpPut("update/{id}")]
        public async Task<IActionResult> Update(string id, Form8Dto dto)
        {
            var record = await _context.Form8Records.FindAsync(id);
            if (record == null)
                return NotFound();

            record.No = dto.No;
            record.Network_Engineer_Kpi = dto.Network_Engineer_Kpi;
            record.Division = dto.Division;
            record.Section = dto.Section;
            record.Kpi_Percent = dto.Kpi_Percent;
            record.UpdatedAt = DateTime.Now.ToString("yyyy-MM-dd HH:mm:ss");

            await _context.SaveChangesAsync();
            return Ok(record);
        }

        // DELETE /form8/delete/{id}
        [HttpDelete("delete/{id}")]
        public async Task<IActionResult> Delete(string id)
        {
            var record = await _context.Form8Records.FindAsync(id);
            if (record == null)
                return NotFound();

            _context.Form8Records.Remove(record);
            await _context.SaveChangesAsync();

            return Ok();
        }
    }
}
