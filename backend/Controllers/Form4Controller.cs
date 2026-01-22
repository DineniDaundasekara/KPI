using System;
using System.Linq;
using backend.Data;
using backend.Models;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

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

        // =================================================
        // FORM4 MASTER LIST
        // =================================================
        [HttpGet]
        public async Task<IActionResult> GetAll([FromQuery] byte? month, [FromQuery] short? year)
        {
            var query = _context.Form4_2025.AsNoTracking();

            if (month.HasValue && month.Value > 0)
            {
                query = query.Where(x => x.Month == month.Value);
            }

            if (year.HasValue && year.Value > 0)
            {
                query = query.Where(x => x.Year == year.Value);
            }

            var result = await query
                .OrderBy(x => x.No)
                .Select(x => new ServiceFulfilmentKpiDto
                {
                    Id = x.Id,
                    No = x.No,
                    Kpi = x.Kpi,
                    Target = x.Target,
                    Calculation = x.Calculation,
                    Platform = x.Platform,
                    ResponsibleDgm = x.ResponsibleDgm,
                    Definedoladetails = x.DefineDoladetails,
                    Weightage = x.Weightage,
                    DataSources = x.DataSources,
                    Month = x.Month,
                    Year = x.Year
                })
                .ToListAsync();

            return Ok(result);
        }

        [HttpGet("{id}")]
        public async Task<IActionResult> GetById(string id)
        {
            var entity = await _context.Form4_2025.AsNoTracking().FirstOrDefaultAsync(x => x.Id == id);
            if (entity == null)
            {
                return NotFound();
            }

            return Ok(MapToDto(entity));
        }

        [HttpPost("add")]
        public async Task<IActionResult> Add([FromBody] ServiceFulfilmentKpiDto dto)
        {
            if (!ModelState.IsValid)
            {
                return BadRequest(ModelState);
            }

            var entity = new Form4_2025
            {
                Id = Guid.NewGuid().ToString(),
                UpdatedAt = DateTime.UtcNow.ToString("O"),
                Month = dto.Month != 0 ? dto.Month : (byte)DateTime.UtcNow.Month,
                Year = dto.Year != 0 ? dto.Year : (short)DateTime.UtcNow.Year
            };

            ApplyDtoToEntity(entity, dto);

            _context.Form4_2025.Add(entity);
            await _context.SaveChangesAsync();

            return CreatedAtAction(nameof(GetById), new { id = entity.Id }, MapToDto(entity));
        }

        [HttpPut("update/{id}")]
        public async Task<IActionResult> Update(string id, [FromBody] ServiceFulfilmentKpiDto dto)
        {
            var entity = await _context.Form4_2025.FirstOrDefaultAsync(x => x.Id == id);
            if (entity == null)
            {
                return NotFound();
            }

            ApplyDtoToEntity(entity, dto);
            entity.UpdatedAt = DateTime.UtcNow.ToString("O");

            await _context.SaveChangesAsync();

            return Ok(MapToDto(entity));
        }

        [HttpDelete("delete/{id}")]
        public async Task<IActionResult> Delete(string id)
        {
            var entity = await _context.Form4_2025.FirstOrDefaultAsync(x => x.Id == id);
            if (entity == null)
            {
                return NotFound();
            }

            _context.Form4_2025.Remove(entity);
            await _context.SaveChangesAsync();

            return NoContent();
        }

        // =================================================
        // FILTERED SERVICE FULFILMENT METRICS
        // =================================================
        // /form4/metrics?month=11&year=2025&area=CENHKMD
        [HttpGet("metrics")]
        public async Task<IActionResult> GetMetrics(
            [FromQuery] byte month,
            [FromQuery] short year,
            [FromQuery] string? area)
        {
            var query = _context.Form4_2025_Metrics
                .AsNoTracking()
                .Include(m => m.Form4)
                .Where(m => m.Month == month && m.Year == year);

            if (!string.IsNullOrWhiteSpace(area))
            {
                var normalized = area.Trim().ToUpper();
                query = query.Where(m => m.AreaCode.ToUpper() == normalized);
            }

            var result = await query
                .OrderBy(m => m.Form4.No)
                .Select(m => new
                {
                    // KPI master data
                    id = m.Form4.Id,
                    no = m.Form4.No,
                    kpi = m.Form4.Kpi,
                    target = m.Form4.Target,
                    platform = m.Form4.Platform,
                    responsibleDgm = m.Form4.ResponsibleDgm,
                    weightage = m.Form4.Weightage,

                    // Metric data
                    area = m.AreaCode,
                    kpi_value = m.KpiValue,
                    month = m.Month,
                    year = m.Year
                })
                .ToListAsync();

            return Ok(result);
        }

        private static ServiceFulfilmentKpiDto MapToDto(Form4_2025 entity) => new ServiceFulfilmentKpiDto
        {
            Id = entity.Id,
            No = entity.No,
            Kpi = entity.Kpi,
            Target = entity.Target,
            Calculation = entity.Calculation,
            Platform = entity.Platform,
            ResponsibleDgm = entity.ResponsibleDgm,
            Definedoladetails = entity.DefineDoladetails,
            Weightage = entity.Weightage,
            DataSources = entity.DataSources,
            Month = entity.Month,
            Year = entity.Year
        };

        private static void ApplyDtoToEntity(Form4_2025 entity, ServiceFulfilmentKpiDto dto)
        {
            entity.No = dto.No;
            entity.Kpi = dto.Kpi ?? string.Empty;
            entity.Target = dto.Target ?? string.Empty;
            entity.Calculation = dto.Calculation ?? string.Empty;
            entity.Platform = dto.Platform ?? string.Empty;
            entity.ResponsibleDgm = dto.ResponsibleDgm ?? string.Empty;
            entity.DefineDoladetails = dto.Definedoladetails ?? string.Empty;
            entity.Weightage = dto.Weightage;
            entity.DataSources = dto.DataSources ?? string.Empty;

            if (dto.Month > 0)
            {
                entity.Month = dto.Month;
            }

            if (dto.Year > 0)
            {
                entity.Year = dto.Year;
            }
        }
    }

    public class ServiceFulfilmentKpiDto
    {
        public string? Id { get; set; }
        public int No { get; set; }
        public string? Kpi { get; set; }
        public string? Target { get; set; }
        public string? Calculation { get; set; }
        public string? Platform { get; set; }
        public string? ResponsibleDgm { get; set; }
        public string? Definedoladetails { get; set; }
        public int Weightage { get; set; }
        public string? DataSources { get; set; }
        public byte Month { get; set; }
        public short Year { get; set; }
    }
}
