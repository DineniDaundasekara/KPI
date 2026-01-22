using System;
using System.Linq;
using System.Threading.Tasks;
using backend.Data;
using backend.DTOs;
using backend.Models;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace backend.Controllers
{
    [ApiController]
    [Route("service-fulfilment-kpi")]
    public class ServiceFulfilmentKpiController : ControllerBase
    {
        private readonly AppDbContext _context;

        public ServiceFulfilmentKpiController(AppDbContext context)
        {
            _context = context;
        }

        // =========================
        // MASTER LIST
        // =========================
        [HttpGet]
        public async Task<IActionResult> GetAll([FromQuery] byte? month, [FromQuery] short? year)
        {
            var query = _context.ServiceFulfilmentKpis.AsNoTracking();

            if (month.HasValue && month.Value > 0)
                query = query.Where(x => x.Month == month.Value);

            if (year.HasValue && year.Value > 0)
                query = query.Where(x => x.Year == year.Value);

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
                    DefineDoladetails = x.DefineDoladetails,
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
            var entity = await _context.ServiceFulfilmentKpis
                .AsNoTracking()
                .FirstOrDefaultAsync(x => x.Id == id);

            if (entity == null) return NotFound();

            return Ok(MapToDto(entity));
        }

        [HttpPost("add")]
        public async Task<IActionResult> Add([FromBody] ServiceFulfilmentKpiDto dto)
        {
            if (!ModelState.IsValid) return BadRequest(ModelState);

            var entity = new ServiceFulfilmentKpi
            {
                Id = Guid.NewGuid().ToString(),
                UpdatedAt = DateTime.UtcNow.ToString("O"),
                Month = dto.Month != 0 ? dto.Month : (byte)DateTime.UtcNow.Month,
                Year = dto.Year != 0 ? dto.Year : (short)DateTime.UtcNow.Year
            };

            ApplyDtoToEntity(entity, dto);

            _context.ServiceFulfilmentKpis.Add(entity);
            await _context.SaveChangesAsync();

            return CreatedAtAction(nameof(GetById), new { id = entity.Id }, MapToDto(entity));
        }

        [HttpPut("update/{id}")]
        public async Task<IActionResult> Update(string id, [FromBody] ServiceFulfilmentKpiDto dto)
        {
            var entity = await _context.ServiceFulfilmentKpis.FirstOrDefaultAsync(x => x.Id == id);
            if (entity == null) return NotFound();

            ApplyDtoToEntity(entity, dto);
            entity.UpdatedAt = DateTime.UtcNow.ToString("O");

            await _context.SaveChangesAsync();
            return Ok(MapToDto(entity));
        }

        [HttpDelete("delete/{id}")]
        public async Task<IActionResult> Delete(string id)
        {
            var entity = await _context.ServiceFulfilmentKpis.FirstOrDefaultAsync(x => x.Id == id);
            if (entity == null) return NotFound();

            _context.ServiceFulfilmentKpis.Remove(entity);
            await _context.SaveChangesAsync();

            return NoContent();
        }

        // =========================
        // METRICS
        // GET /service-fulfilment-kpi/metrics?month=11&year=2025&area=CENHKMD
        // =========================
        [HttpGet("metrics")]
        public async Task<IActionResult> GetMetrics(
            [FromQuery] byte month,
            [FromQuery] short year,
            [FromQuery] string? area)
        {
            var query = from metric in _context.ServiceFulfilmentKpiMetrics
                        join kpi in _context.ServiceFulfilmentKpis on metric.ServiceFulfilmentKpiId equals kpi.Id
                        where metric.Month == month && metric.Year == year
                        select new { metric, kpi };

            if (!string.IsNullOrWhiteSpace(area))
            {
                var normalized = area.Trim().ToUpper();
                query = query.Where(x => x.metric.AreaCode != null && x.metric.AreaCode.ToUpper() == normalized);
            }

            var result = await query
                .AsNoTracking()
                .OrderBy(x => x.kpi.No)
                .Select(x => new
                {
                    id = x.kpi.Id,
                    no = x.kpi.No,
                    kpi = x.kpi.Kpi,
                    target = x.kpi.Target,
                    platform = x.kpi.Platform,
                    responsibleDgm = x.kpi.ResponsibleDgm,
                    definedoladetails = x.kpi.DefineDoladetails,
                    weightage = x.kpi.Weightage,

                    area = x.metric.AreaCode ?? string.Empty,
                    kpi_value = x.metric.KpiValue,
                    month = x.metric.Month,
                    year = x.metric.Year
                })
                .ToListAsync();

            return Ok(result);
        }

        [HttpPost("metrics")]
        public async Task<IActionResult> UpsertMetric([FromBody] UpsertServiceFulfilmentMetricDto dto)
        {
            if (dto == null)
            {
                return BadRequest("Request body is required.");
            }

            if (string.IsNullOrWhiteSpace(dto.ServiceFulfilmentKpiId))
            {
                return BadRequest("ServiceFulfilmentKpiId is required.");
            }

            if (dto.Month == 0 || dto.Year == 0)
            {
                return BadRequest("Month and Year must be greater than zero.");
            }

            var kpi = await _context.ServiceFulfilmentKpis
                .FirstOrDefaultAsync(x => x.Id == dto.ServiceFulfilmentKpiId);

            if (kpi == null)
            {
                return NotFound($"Service Fulfilment KPI with id '{dto.ServiceFulfilmentKpiId}' was not found.");
            }

            var normalizedArea = (dto.AreaCode ?? string.Empty).Trim().ToUpper();
            if (string.IsNullOrWhiteSpace(normalizedArea))
            {
                return BadRequest("AreaCode is required.");
            }

            var metric = await _context.ServiceFulfilmentKpiMetrics.FirstOrDefaultAsync(x =>
                x.ServiceFulfilmentKpiId == dto.ServiceFulfilmentKpiId &&
                x.AreaCode.ToUpper() == normalizedArea &&
                x.Month == dto.Month &&
                x.Year == dto.Year);

            if (metric == null)
            {
                metric = new ServiceFulfilmentKpiMetric
                {
                    ServiceFulfilmentKpiId = dto.ServiceFulfilmentKpiId,
                    AreaCode = normalizedArea,
                    KpiValue = dto.KpiValue,
                    Month = dto.Month,
                    Year = dto.Year
                };
                _context.ServiceFulfilmentKpiMetrics.Add(metric);
            }
            else
            {
                metric.AreaCode = normalizedArea;
                metric.KpiValue = dto.KpiValue;
                metric.Month = dto.Month;
                metric.Year = dto.Year;
            }

            await _context.SaveChangesAsync();

            var response = new
            {
                id = kpi.Id,
                no = kpi.No,
                kpi = kpi.Kpi,
                target = kpi.Target,
                platform = kpi.Platform,
                responsibleDgm = kpi.ResponsibleDgm,
                definedoladetails = kpi.DefineDoladetails,
                weightage = kpi.Weightage,
                area = metric.AreaCode,
                kpi_value = metric.KpiValue,
                month = metric.Month,
                year = metric.Year
            };

            return Ok(response);
        }

        private static ServiceFulfilmentKpiDto MapToDto(ServiceFulfilmentKpi entity) => new ServiceFulfilmentKpiDto
        {
            Id = entity.Id,
            No = entity.No,
            Kpi = entity.Kpi,
            Target = entity.Target,
            Calculation = entity.Calculation,
            Platform = entity.Platform,
            ResponsibleDgm = entity.ResponsibleDgm,
            DefineDoladetails = entity.DefineDoladetails,
            Weightage = entity.Weightage,
            DataSources = entity.DataSources,
            Month = entity.Month,
            Year = entity.Year
        };

        private static void ApplyDtoToEntity(ServiceFulfilmentKpi entity, ServiceFulfilmentKpiDto dto)
        {
            entity.No = dto.No;
            entity.Kpi = dto.Kpi ?? string.Empty;
            entity.Target = dto.Target ?? string.Empty;
            entity.Calculation = dto.Calculation ?? string.Empty;
            entity.Platform = dto.Platform ?? string.Empty;
            entity.ResponsibleDgm = dto.ResponsibleDgm ?? string.Empty;
            entity.DefineDoladetails = dto.DefineDoladetails ?? string.Empty;
            entity.Weightage = dto.Weightage;
            entity.DataSources = dto.DataSources ?? string.Empty;

            if (dto.Month > 0) entity.Month = dto.Month;
            if (dto.Year > 0) entity.Year = dto.Year;
        }
    }
}
