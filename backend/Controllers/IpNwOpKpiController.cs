using System;
using System.Collections.Generic;
using System.Linq;
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

        // ? GET: /form6
        // Returns KPI rows + metrics dictionaries from form6_kpi_metrics
        [HttpGet("")]
        public async Task<IActionResult> GetAll()
        {
            var baseRows = await _db.IpNwOpKpis
                .AsNoTracking()
                .OrderBy(x => x.No)
                .Select(x => new
                {
                    x.Id,
                    x.No,
                    x.NetworkEngineerKpi,
                    x.Division,
                    x.Section,
                    x.KpiPercent
                })
                .ToListAsync();

            var ids = baseRows.Select(x => x.Id).ToList();

            var metrics = await _db.Form6KpiMetrics
                .AsNoTracking()
                .Where(m => ids.Contains(m.Form6Id))
                .ToListAsync();

            var metricsByForm6 = metrics
                .GroupBy(m => m.Form6Id)
                .ToDictionary(
                    g => g.Key,
                    g => new
                    {
                        unavailable_minutes = BuildMetricDictionary(g, m => m.UnavailableMinutes),
                        total_minutes = BuildMetricDictionary(g, m => m.TotalMinutes),
                        total_nodes = BuildMetricDictionary(g, m => m.TotalNodes)
                    }
                );

            var result = baseRows.Select(x =>
            {
                metricsByForm6.TryGetValue(x.Id, out var m);

                return new
                {
                    _id = x.Id,
                    no = x.No,
                    network_engineer_kpi = x.NetworkEngineerKpi,
                    division = x.Division,
                    section = x.Section,
                    kpi_percent = x.KpiPercent,

                    unavailable_minutes = m?.unavailable_minutes ?? new Dictionary<string, int?>(),
                    total_minutes = m?.total_minutes ?? new Dictionary<string, int?>(),
                    total_nodes = m?.total_nodes ?? new Dictionary<string, int?>()
                };
            });

            return Ok(result);
        }

        // ? POST: /form6/add
        [HttpPost("add")]
        public async Task<IActionResult> Add([FromBody] IpNwOpKpiDto dto)
        {
            var entity = new IpNwOpKpi
            {
                Id = Guid.NewGuid().ToString("N"), // fits nvarchar(64)
                No = dto.no,
                NetworkEngineerKpi = dto.network_engineer_kpi,
                Division = dto.division,
                Section = dto.section,
                KpiPercent = dto.kpi_percent
            };

            ApplyMetricDictionaries(entity, dto);
            _db.IpNwOpKpis.Add(entity);
            await _db.SaveChangesAsync();

            return Ok(new { message = "Created", id = entity.Id });
        }

        // ? PUT: /form6/update/{id}
        [HttpPut("update/{id}")]
        public async Task<IActionResult> Update(string id, [FromBody] IpNwOpKpiDto dto)
        {
            var entity = await _db.IpNwOpKpis
                .Include(x => x.Metrics)
                .FirstOrDefaultAsync(x => x.Id == id);
            if (entity == null) return NotFound();

            entity.No = dto.no;
            entity.NetworkEngineerKpi = dto.network_engineer_kpi;
            entity.Division = dto.division;
            entity.Section = dto.section;
            entity.KpiPercent = dto.kpi_percent;

            ApplyMetricDictionaries(entity, dto);

            await _db.SaveChangesAsync();
            return Ok(new { message = "Updated" });
        }

        // ? DELETE: /form6/delete/{id}
        [HttpDelete("delete/{id}")]
        public async Task<IActionResult> Delete(string id)
        {
            var entity = await _db.IpNwOpKpis.FirstOrDefaultAsync(x => x.Id == id);
            if (entity == null) return NotFound();

            // remove metrics first (safe with FK)
            var metrics = await _db.Form6KpiMetrics
                .Where(m => m.Form6Id == id)
                .ToListAsync();

            if (metrics.Count > 0)
                _db.Form6KpiMetrics.RemoveRange(metrics);

            _db.IpNwOpKpis.Remove(entity);
            await _db.SaveChangesAsync();

            return Ok(new { message = "Deleted" });
        }

        // ? PUT: /form6/metrics/{form6Id}/{areaCode}
        [HttpPut("metrics/{form6Id}/{areaCode}")]
        public async Task<IActionResult> UpsertMetric(
            string form6Id,
            string areaCode,
            [FromBody] Form6MetricUpsertDto dto
        )
        {
            var exists = await _db.IpNwOpKpis.AnyAsync(x => x.Id == form6Id);
            if (!exists) return NotFound(new { message = "form6_id not found" });

            var code = NormalizeAreaCode(areaCode);
            if (string.IsNullOrEmpty(code))
            {
                return BadRequest(new { message = "areaCode is required" });
            }

            var row = await _db.Form6KpiMetrics
                .FirstOrDefaultAsync(x => x.Form6Id == form6Id && x.AreaCode != null && x.AreaCode.ToLower() == code);

            if (row == null)
            {
                row = new Form6KpiMetric
                {
                    Form6Id = form6Id,
                    AreaCode = code,
                    UnavailableMinutes = dto.unavailable_minutes,
                    TotalMinutes = dto.total_minutes,
                    TotalNodes = dto.total_nodes
                };
                _db.Form6KpiMetrics.Add(row);
            }
            else
            {
                row.UnavailableMinutes = dto.unavailable_minutes;
                row.TotalMinutes = dto.total_minutes;
                row.TotalNodes = dto.total_nodes;
            }

            await _db.SaveChangesAsync();
            return Ok(new { message = "Metric saved" });
        }

        private static string NormalizeAreaCode(string? areaCode)
            => string.IsNullOrWhiteSpace(areaCode) ? string.Empty : areaCode.Trim().ToLowerInvariant();

        private static Dictionary<string, int?> BuildMetricDictionary(
            IEnumerable<Form6KpiMetric> metrics,
            Func<Form6KpiMetric, int?> selector)
        {
            var dict = new Dictionary<string, int?>(StringComparer.OrdinalIgnoreCase);

            foreach (var metric in metrics)
            {
                var key = NormalizeAreaCode(metric.AreaCode);
                if (string.IsNullOrEmpty(key)) continue;

                dict[key] = selector(metric);
            }

            return dict;
        }

        private void ApplyMetricDictionaries(IpNwOpKpi entity, IpNwOpKpiDto dto)
        {
            if (entity.Metrics == null)
            {
                entity.Metrics = new List<Form6KpiMetric>();
            }

            var existing = entity.Metrics
                .Where(m => !string.IsNullOrWhiteSpace(m.AreaCode))
                .ToDictionary(m => NormalizeAreaCode(m.AreaCode), m => m, StringComparer.OrdinalIgnoreCase);

            void apply(Dictionary<string, int?>? source, Action<Form6KpiMetric, int?> setter)
            {
                if (source == null) return;

                foreach (var kvp in source)
                {
                    var key = NormalizeAreaCode(kvp.Key);
                    if (string.IsNullOrEmpty(key)) continue;

                    if (!existing.TryGetValue(key, out var metric))
                    {
                        metric = new Form6KpiMetric
                        {
                            Form6Id = entity.Id,
                            AreaCode = key
                        };
                        existing[key] = metric;
                        entity.Metrics.Add(metric);
                        _db.Form6KpiMetrics.Add(metric);
                    }

                    setter(metric, kvp.Value);
                }
            }

            apply(dto.unavailable_minutes, (metric, value) => metric.UnavailableMinutes = value);
            apply(dto.total_minutes, (metric, value) => metric.TotalMinutes = value);
            apply(dto.total_nodes, (metric, value) => metric.TotalNodes = value);
        }

        public class Form6MetricUpsertDto
        {
            public int? unavailable_minutes { get; set; }
            public int? total_minutes { get; set; }
            public int? total_nodes { get; set; }
        }
    }
}
