using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using backend.Data;
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

        // GET /form8
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
                    m.unavailable_minutes,
                    m.total_minutes,
                    m.total_nodes
                FROM form8_2025 f
                JOIN form8_2025_metrics m
                    ON f.metrics_id = m.id
            ";

            var data = await _context.Database
                .SqlQueryRaw<Form8Result>(sql)
                .ToListAsync();

            return Ok(data);
        }

        // POST /form8/add
        [HttpPost("add")]
        public async Task<IActionResult> Add(Form8Dto dto)
        {
            var record = new backend.Models.Form8_2025
            {
                Id = Guid.NewGuid().ToString(),
                No = dto.No,
                Network_Engineer_Kpi = dto.Network_Engineer_Kpi,
                Division = dto.Division,
                Section = dto.Section,
                Kpi_Percent = dto.Kpi_Percent,
                Month = (byte)DateTime.Now.Month,
                Year = (short)DateTime.Now.Year,
                UpdatedAt = DateTime.Now.ToString("yyyy-MM-dd HH:mm:ss"),
                Metrics_Id = 0
            };

            _context.Form8Records.Add(record);
            await _context.SaveChangesAsync();

            return Ok(record);
        }
    }

    // ✅ LOCAL RESULT TYPE (NO NEW FILE)
    public class Form8Result
    {
        public string id { get; set; } = null!;
        public byte no { get; set; }
        public string network_engineer_kpi { get; set; } = null!;
        public string division { get; set; } = null!;
        public string section { get; set; } = null!;
        public double kpi_percent { get; set; }
        public byte month { get; set; }
        public short year { get; set; }

        public int unavailable_minutes { get; set; }
        public int total_minutes { get; set; }
        public int total_nodes { get; set; }
    }
}
