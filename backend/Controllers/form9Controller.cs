using backend.Data;
using backend.DTOs;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace backend.Controllers
{
    [ApiController]
    [Route("form9")]
    public class Form9Controller : ControllerBase
    {
        private readonly AppDbContext _context;

        public Form9Controller(AppDbContext context)
        {
            _context = context;
        }

        // GET /form9
        [HttpGet]
        public async Task<IActionResult> GetAll()
        {
            var sql = @"
                SELECT
                    f.id,
                    f.no,
                    f.network_engineer_kpi,
                    f.division,
                    f.section,
                    f.kpi_percent,
                    f.month,
                    f.year,
                    m.incident_count AS Total_Failed_Links,
                    m.restoration_time_hours AS Links_SLA_Not_Violated
                FROM form9_2025 f
                JOIN form9_2025_metrics m
                    ON f.metrics_id = m.id
            ";

            var data = await _context.Database
                .SqlQueryRaw<Form9Result>(sql)
                .ToListAsync();

            return Ok(data);
        }

        // POST /form9/add
        [HttpPost("add")]
        public async Task<IActionResult> Add(Form9Dto dto)
        {
            var record = new backend.Models.Form9_2025
            {
                Id = Guid.NewGuid().ToString(),
                No = dto.No,
                Network_Engineer_Kpi = dto.Network_Engineer_Kpi,
                Division = dto.Division,
                Section = dto.Section,
                Kpi_Percent = dto.Kpi_Percent,
                Month = dto.Month == 0 ? (byte)DateTime.Now.Month : dto.Month,
                Year = dto.Year == 0 ? (short)DateTime.Now.Year : dto.Year,
                UpdatedAt = DateTime.Now.ToString("yyyy-MM-dd HH:mm:ss"),
                Metrics_Id = 0
            };

            _context.Form9_2025.Add(record);
            await _context.SaveChangesAsync();

            return Ok(record);
        }
    }

    // ✅ LOCAL RESULT TYPE (NO NEW FILE)
    public class Form9Result
    {
        public string id { get; set; } = null!;
        public byte no { get; set; }
        public string network_engineer_kpi { get; set; } = null!;
        public string division { get; set; } = null!;
        public string section { get; set; } = null!;
        public double kpi_percent { get; set; }
        public byte month { get; set; }
        public short year { get; set; }

        public int Total_Failed_Links { get; set; }
        public int Links_SLA_Not_Violated { get; set; }
    }
}
