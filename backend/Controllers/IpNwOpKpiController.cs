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
        // GET: /form6?month=11&year=2025&area=cenhkmd
        // =========================================================
        [HttpGet("")]
        public async Task<IActionResult> GetAll([FromQuery] byte? month, [FromQuery] short? year, [FromQuery] string? area)
        {
            var query = _db.IpNwOpKpis
                .AsNoTracking()
                .Include(x => x.Metrics)
                .AsQueryable();

            if (month.HasValue)
                query = query.Where(x => x.Month == month.Value);

            if (year.HasValue)
                query = query.Where(x => x.Year == year.Value);

            var normalizedArea = NormalizeAreaCode(area);

            var rows = await query
                .OrderBy(x => x.No)
                .ToListAsync();

            var data = rows
                .Select(x => MapToDto(x, normalizedArea))
                .ToList();

            return Ok(data);
        }

        // =========================================================
        // GET BY ID (KPI + Metrics)
        // GET: /form6/{id}
        // =========================================================
        [HttpGet("{id}")]
        public async Task<IActionResult> GetById(string id)
        {
            var entity = await _db.IpNwOpKpis
                .AsNoTracking()
                .Include(x => x.Metrics)
                .FirstOrDefaultAsync(x => x.Id == id);

            if (entity == null) return NotFound();

            return Ok(MapToDto(entity, string.Empty));
        }

        // =========================================================
        // ADD (KPI + optional Metrics list)
        // POST: /form6/add
        // =========================================================
        [HttpPost("add")]
        public async Task<IActionResult> Add([FromBody] IpNwOpKpiDto dto)
        {
            if (dto == null) return BadRequest("Body is empty.");

            var entity = new IpNwOpKpi
            {
                Id = Guid.NewGuid().ToString("N"), // nvarchar(64)
                No = dto.No,
                NetworkEngineerKpi = dto.NetworkEngineerKpi ?? "",
                Division = dto.Division ?? "",
                Section = dto.Section ?? "",
                KpiPercent = dto.KpiPercent,

                Month = dto.Month ?? (byte)DateTime.UtcNow.Month,
                Year = dto.Year ?? (short)DateTime.UtcNow.Year,
                UpdatedAt = DateTime.UtcNow
            };

            foreach (var area in CollectMetricAreas(dto))
            {
                entity.Metrics.Add(new IpNwOpKpiMetric
                {
                    IpNwOpKpiId = entity.Id,
                    AreaCode = area,
                    UnavailableMinutes = TryGetMetricValue(dto.UnavailableMinutes, area),
                    TotalMinutes = TryGetMetricValue(dto.TotalMinutes, area),
                    TotalNodes = TryGetMetricValue(dto.TotalNodes, area)
                });
            }

            _db.IpNwOpKpis.Add(entity);
            await _db.SaveChangesAsync();

            return Ok(new { message = "Created", id = entity.Id });
        }

        // =========================================================
        // UPDATE (KPI fields only)
        // PUT: /form6/update/{id}
        // =========================================================
        [HttpPut("update/{id}")]
        public async Task<IActionResult> Update(string id, [FromBody] IpNwOpKpiDto dto)
        {
            if (dto == null) return BadRequest("Body is empty.");

            var entity = await _db.IpNwOpKpis.FirstOrDefaultAsync(x => x.Id == id);
            if (entity == null) return NotFound();

            entity.No = dto.No;
            entity.NetworkEngineerKpi = dto.NetworkEngineerKpi ?? "";
            entity.Division = dto.Division ?? "";
            entity.Section = dto.Section ?? "";
            entity.KpiPercent = dto.KpiPercent;

            if (dto.Month.HasValue) entity.Month = dto.Month.Value;
            if (dto.Year.HasValue) entity.Year = dto.Year.Value;

            entity.UpdatedAt = DateTime.UtcNow;

            await _db.SaveChangesAsync();
            return Ok(new { message = "Updated" });
        }

        // =========================================================
        // DELETE KPI (metrics deleted by FK cascade OR manual safe delete)
        // DELETE: /form6/delete/{id}
        // =========================================================
        [HttpDelete("delete/{id}")]
        public async Task<IActionResult> Delete(string id)
        {
            var entity = await _db.IpNwOpKpis.FirstOrDefaultAsync(x => x.Id == id);
            if (entity == null) return NotFound();

            _db.IpNwOpKpis.Remove(entity);
            await _db.SaveChangesAsync();

            return Ok(new { message = "Deleted" });
        }

        // =========================================================
        // UPSERT SINGLE METRIC
        // PUT: /form6/metrics/{kpiId}/{areaCode}
        // =========================================================
        [HttpPut("metrics/{kpiId}/{areaCode}")]
        public async Task<IActionResult> UpsertMetric(string kpiId, string areaCode, [FromBody] IpNwOpMetricUpsertDto dto)
        {
            var exists = await _db.IpNwOpKpis.AnyAsync(x => x.Id == kpiId);
            if (!exists) return NotFound(new { message = "kpiId not found" });

            var code = NormalizeAreaCode(areaCode);
            if (string.IsNullOrEmpty(code))
                return BadRequest(new { message = "areaCode is required" });

            var row = await _db.IpNwOpKpiMetrics
                .FirstOrDefaultAsync(x => x.IpNwOpKpiId == kpiId && x.AreaCode.ToLower() == code);

            if (row == null)
            {
                row = new IpNwOpKpiMetric
                {
                    IpNwOpKpiId = kpiId,
                    AreaCode = code
                };
                _db.IpNwOpKpiMetrics.Add(row);
            }

            row.UnavailableMinutes = dto.UnavailableMinutes;
            row.TotalMinutes = dto.TotalMinutes;
            row.TotalNodes = dto.TotalNodes;

            await _db.SaveChangesAsync();
            return Ok(new { message = "Metric saved" });
        }

        // =========================
        // helpers
        // =========================
        private static string NormalizeAreaCode(string? areaCode)
            => string.IsNullOrWhiteSpace(areaCode) ? string.Empty : areaCode.Trim().ToLowerInvariant();

        private static IpNwOpKpiDto MapToDto(IpNwOpKpi entity, string normalizedArea)
        {
            var metrics = entity.Metrics ?? new List<IpNwOpKpiMetric>();

            return new IpNwOpKpiDto
            {
                Id = entity.Id,
                No = entity.No,
                NetworkEngineerKpi = entity.NetworkEngineerKpi,
                Division = entity.Division,
                Section = entity.Section,
                KpiPercent = entity.KpiPercent,
                Month = entity.Month,
                Year = entity.Year,
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

        private static IEnumerable<string> CollectMetricAreas(IpNwOpKpiDto dto)
        {
            var set = new HashSet<string>(StringComparer.OrdinalIgnoreCase);

            void AddKeys(Dictionary<string, int?>? source)
            {
                if (source == null) return;
                foreach (var key in source.Keys)
                {
                    var normalized = NormalizeAreaCode(key);
                    if (!string.IsNullOrEmpty(normalized))
                    {
                        set.Add(normalized);
                    }
                }
            }

            AddKeys(dto.UnavailableMinutes);
            AddKeys(dto.TotalMinutes);
            AddKeys(dto.TotalNodes);

            return set;
        }

        private static int? TryGetMetricValue(Dictionary<string, int?>? source, string normalizedKey)
        {
            if (source == null) return null;
            foreach (var kvp in source)
            {
                if (NormalizeAreaCode(kvp.Key) == normalizedKey)
                {
                    return kvp.Value;
                }
            }
            return null;
        }

        public class IpNwOpMetricUpsertDto
        {
            public int? UnavailableMinutes { get; set; }
            public int? TotalMinutes { get; set; }
            public int? TotalNodes { get; set; }
        }
    }
}
