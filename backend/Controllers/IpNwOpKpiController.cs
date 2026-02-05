using System;
using System.Collections.Generic;
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
    [Route("ip-nw-op")]
    public class IpNwOpKpiController : ControllerBase
    {
        private readonly AppDbContext _db;

        public IpNwOpKpiController(AppDbContext db)
        {
            _db = db;
        }

        // =========================================================
        // GET ALL (KPI + Metrics)
        // GET: /ip-nw-op?month=11&year=2025&area=cenhkmd
        // NOTE: month/year are in Metrics table now
        // =========================================================
        [HttpGet("")]
        public async Task<IActionResult> GetAll(
            [FromQuery] byte? month,
            [FromQuery] short? year,
            [FromQuery] string? area)
        {
            var normalizedArea = NormalizeAreaCode(area);

            // KPI query
            var kpiQuery = _db.IpNwOpKpis.AsNoTracking().AsQueryable();

            var kpis = await kpiQuery
                .OrderBy(x => x.Id)
                .ToListAsync();

            // metrics query (filtered by month/year/area)
            var metricsQuery = _db.IpNwOpKpiMetrics.AsNoTracking().AsQueryable();

            if (month.HasValue && month.Value > 0)
                metricsQuery = metricsQuery.Where(m => m.Month == month.Value);

            if (year.HasValue && year.Value > 0)
                metricsQuery = metricsQuery.Where(m => m.Year == year.Value);

            if (!string.IsNullOrEmpty(normalizedArea))
                metricsQuery = metricsQuery.Where(m => m.AreaCode.ToLower() == normalizedArea);

            var metrics = await metricsQuery.ToListAsync();

            // group metrics by KPI id
            var metricsByKpi = metrics
                .GroupBy(m => m.IpNwOpKpiId)
                .ToDictionary(g => g.Key, g => g.ToList());

            var data = kpis.Select(k =>
            {
                metricsByKpi.TryGetValue(k.Id, out var list);
                list ??= new List<IpNwOpKpiMetric>();

                return MapToDto(k, list, normalizedArea);
            }).ToList();

            return Ok(data);
        }

        // =========================================================
        // GET BY ID (KPI + Metrics)
        // GET: /ip-nw-op/{id}?month=11&year=2025&area=cenhkmd
        // =========================================================
        [HttpGet("{id:int}")]
        public async Task<IActionResult> GetById(
            int id,
            [FromQuery] byte? month,
            [FromQuery] short? year,
            [FromQuery] string? area)
        {
            var entity = await _db.IpNwOpKpis
                .AsNoTracking()
                .FirstOrDefaultAsync(x => x.Id == id);

            if (entity == null) return NotFound();

            var normalizedArea = NormalizeAreaCode(area);

            var metricsQuery = _db.IpNwOpKpiMetrics
                .AsNoTracking()
                .Where(m => m.IpNwOpKpiId == id);

            if (month.HasValue && month.Value > 0)
                metricsQuery = metricsQuery.Where(m => m.Month == month.Value);

            if (year.HasValue && year.Value > 0)
                metricsQuery = metricsQuery.Where(m => m.Year == year.Value);

            if (!string.IsNullOrEmpty(normalizedArea))
                metricsQuery = metricsQuery.Where(m => m.AreaCode.ToLower() == normalizedArea);

            var metrics = await metricsQuery.ToListAsync();

            return Ok(MapToDto(entity, metrics, normalizedArea));
        }

        // =========================================================
        // ADD KPI (no metrics here)
        // POST: /ip-nw-op/add
        // =========================================================
        [HttpPost("add")]
        public async Task<IActionResult> Add([FromBody] IpNwOpKpiDto dto)
        {
            if (dto == null) return BadRequest("Body is empty.");

            var entity = new IpNwOpKpi
            {
                NetworkEngineerKpi = dto.NetworkEngineerKpi ?? "",
                Division = dto.Division ?? "",
                Section = dto.Section ?? "",
                KpiPercent = dto.KpiPercent,
                UpdatedAt = dto.UpdatedAt ?? DateTime.UtcNow
            };

            _db.IpNwOpKpis.Add(entity);
            await _db.SaveChangesAsync();

            return Ok(new { message = "Created", id = entity.Id });
        }

        // =========================================================
        // UPDATE KPI fields only
        // PUT: /ip-nw-op/update/{id}
        // =========================================================
        [HttpPut("update/{id:int}")]
        public async Task<IActionResult> Update(int id, [FromBody] IpNwOpKpiDto dto)
        {
            if (dto == null) return BadRequest("Body is empty.");

            var entity = await _db.IpNwOpKpis.FirstOrDefaultAsync(x => x.Id == id);
            if (entity == null) return NotFound();

            entity.NetworkEngineerKpi = dto.NetworkEngineerKpi ?? "";
            entity.Division = dto.Division ?? "";
            entity.Section = dto.Section ?? "";
            entity.KpiPercent = dto.KpiPercent;
            entity.UpdatedAt = DateTime.UtcNow;

            await _db.SaveChangesAsync();
            return Ok(new { message = "Updated" });
        }

        // =========================================================
        // DELETE KPI (metrics deleted by FK cascade)
        // DELETE: /ip-nw-op/delete/{id}
        // =========================================================
        [HttpDelete("delete/{id:int}")]
        public async Task<IActionResult> Delete(int id)
        {
            var entity = await _db.IpNwOpKpis.FirstOrDefaultAsync(x => x.Id == id);
            if (entity == null) return NotFound();

            _db.IpNwOpKpis.Remove(entity);
            await _db.SaveChangesAsync();

            return Ok(new { message = "Deleted" });
        }

        // =========================================================
        // UPSERT SINGLE METRIC (month/year required now)
        // PUT: /ip-nw-op/metrics/{kpiId}/{areaCode}?month=11&year=2025
        // =========================================================
        [HttpPut("metrics/{kpiId:int}/{areaCode}")]
        public async Task<IActionResult> UpsertMetric(
            int kpiId,
            string areaCode,
            [FromQuery] byte month,
            [FromQuery] short year,
            [FromBody] IpNwOpMetricUpsertDto dto)
        {
            var exists = await _db.IpNwOpKpis.AnyAsync(x => x.Id == kpiId);
            if (!exists) return NotFound(new { message = "kpiId not found" });

            if (month < 1 || month > 12) return BadRequest(new { message = "month must be between 1 and 12" });
            if (year <= 0) return BadRequest(new { message = "year must be valid" });

            var code = NormalizeAreaCode(areaCode);
            if (string.IsNullOrEmpty(code))
                return BadRequest(new { message = "areaCode is required" });

            var row = await _db.IpNwOpKpiMetrics.FirstOrDefaultAsync(x =>
                x.IpNwOpKpiId == kpiId &&
                x.AreaCode.ToLower() == code &&
                x.Month == month &&
                x.Year == year);

            if (row == null)
            {
                row = new IpNwOpKpiMetric
                {
                    IpNwOpKpiId = kpiId,
                    AreaCode = code,
                    Month = month,
                    Year = year
                };
                _db.IpNwOpKpiMetrics.Add(row);
            }

            row.UnavailableMinutes = dto.UnavailableMinutes;
            row.TotalMinutes = dto.TotalMinutes;
            row.TotalNodes = dto.TotalNodes;

            await _db.SaveChangesAsync();
            return Ok(new { message = "Metric saved" });
        }

        // =========================================================
        // GET METRICS (month/year/areaCode)
        // GET: /ip-nw-op/metrics?month=11&year=2025&areaCode=cenhkmd
        // =========================================================
        [HttpGet("metrics")]
        public async Task<IActionResult> GetMetrics(
            [FromQuery] byte? month,
            [FromQuery] short? year,
            [FromQuery] string? areaCode)
        {
            var normalizedArea = NormalizeAreaCode(areaCode);

            var metricsQuery = _db.IpNwOpKpiMetrics.AsNoTracking().AsQueryable();

            if (month.HasValue && month.Value > 0)
                metricsQuery = metricsQuery.Where(m => m.Month == month.Value);

            if (year.HasValue && year.Value > 0)
                metricsQuery = metricsQuery.Where(m => m.Year == year.Value);

            if (!string.IsNullOrEmpty(normalizedArea))
                metricsQuery = metricsQuery.Where(m => m.AreaCode.ToLower() == normalizedArea);

            var metrics = await metricsQuery.ToListAsync();
            return Ok(metrics);
        }

        // =========================
        // helpers
        // =========================
        private static string NormalizeAreaCode(string? areaCode)
            => string.IsNullOrWhiteSpace(areaCode) ? string.Empty : areaCode.Trim().ToLowerInvariant();

        private static IpNwOpKpiDto MapToDto(IpNwOpKpi entity, List<IpNwOpKpiMetric> metrics, string normalizedArea)
        {
            return new IpNwOpKpiDto
            {
                Id = entity.Id,
                NetworkEngineerKpi = entity.NetworkEngineerKpi,
                Division = entity.Division,
                Section = entity.Section,
                KpiPercent = entity.KpiPercent,
                UpdatedAt = entity.UpdatedAt,

                UnavailableMinutes = BuildMetricDictionary(metrics, normalizedArea, m => m.UnavailableMinutes),
                TotalMinutes = BuildMetricDictionary(metrics, normalizedArea, m => m.TotalMinutes),
                TotalNodes = BuildMetricDictionary(metrics, normalizedArea, m => m.TotalNodes)
            };
        }

        private static Dictionary<string, int?> BuildMetricDictionary(
            IEnumerable<IpNwOpKpiMetric> metrics,
            string normalizedArea,
            Func<IpNwOpKpiMetric, int?> selector)
        {
            var result = new Dictionary<string, int?>();

            foreach (var metric in metrics)
            {
                var key = NormalizeAreaCode(metric.AreaCode);
                if (string.IsNullOrEmpty(key)) continue;
                if (!string.IsNullOrEmpty(normalizedArea) && key != normalizedArea) continue;

                result[key] = selector(metric);
            }

            return result;
        }

        public class IpNwOpMetricUpsertDto
        {
            public int? UnavailableMinutes { get; set; }
            public int? TotalMinutes { get; set; }
            public int? TotalNodes { get; set; }
        }
    }
}