using System.Text.RegularExpressions;
using backend.Data;
using backend.DTOs;
using backend.Models;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace backend.Controllers
{
    [ApiController]
    [Route("api/overall-kpi-results")]
    public class OverallKpiResultsController : ControllerBase
    {
        private readonly AppDbContext _db;

        public OverallKpiResultsController(AppDbContext db)
        {
            _db = db;
        }

        [HttpGet]
        public async Task<ActionResult<List<OverallKpiResultDto>>> GetAll(
            [FromQuery] int? month,
            [FromQuery] int? year)
        {
            var now = DateTime.UtcNow;
            byte m = (byte)(month ?? now.Month);
            short y = (short)(year ?? now.Year);

            var rows = await _db.OverallKpiResults
                .AsNoTracking()
                .Where(x => x.Month == m && x.Year == y)
                .OrderBy(x => x.KpiDefinitionId)
                .ThenBy(x => x.AreaCode)
                .ToListAsync();

            return Ok(rows.Select(ToDto).ToList());
        }

        [HttpPost("calculate")]
        public async Task<ActionResult<List<OverallKpiResultDto>>> Calculate(
            [FromQuery] int? month,
            [FromQuery] int? year)
        {
            var now = DateTime.UtcNow;
            byte m = (byte)(month ?? now.Month);
            short y = (short)(year ?? now.Year);

            var calculated = await CalculateAndPersistAsync(m, y);
            return Ok(calculated.Select(ToDto).ToList());
        }

        private async Task<List<OverallKpiResult>> CalculateAndPersistAsync(byte month, short year)
        {
            var kpis = await _db.KpiDefinitions
                .AsNoTracking()
                .Where(x => x.Month == month && x.Year == year)
                .OrderBy(x => x.Id)
                .ToListAsync();

            var areaCodes = await _db.RegionData
                .AsNoTracking()
                .Select(x => x.LeaCode)
                .Where(x => x != null && x.Trim() != string.Empty)
                .Distinct()
                .ToListAsync();

            var normalizedAreas = areaCodes
                .Select(a => a.Trim().ToUpperInvariant())
                .Distinct(StringComparer.OrdinalIgnoreCase)
                .ToList();

            if (!kpis.Any() || !normalizedAreas.Any())
            {
                var emptyExisting = await _db.OverallKpiResults
                    .Where(x => x.Month == month && x.Year == year)
                    .ToListAsync();
                if (emptyExisting.Any())
                {
                    _db.OverallKpiResults.RemoveRange(emptyExisting);
                    await _db.SaveChangesAsync();
                }
                return new List<OverallKpiResult>();
            }

            var ipKpis = await _db.IpNwOpKpis.AsNoTracking()
                .Select(x => new NamedKpi("ip", x.Id, x.NetworkEngineerKpi ?? string.Empty))
                .ToListAsync();
            var bbKpis = await _db.BbAnwKpis.AsNoTracking()
                .Select(x => new NamedKpi("bb", x.Id, x.NetworkEngineerKpi ?? string.Empty))
                .ToListAsync();
            var otn1Kpis = await _db.OtnOp1.AsNoTracking()
                .Select(x => new NamedKpi("otn1", x.Id, x.NetworkEngineerKpi ?? string.Empty))
                .ToListAsync();
            var otn2Kpis = await _db.OtnOp2.AsNoTracking()
                .Select(x => new NamedKpi("otn2", x.Id, x.NetworkEngineerKpi ?? string.Empty))
                .ToListAsync();
            var sfKpis = await _db.ServiceFulfilmentKpis.AsNoTracking()
                .Where(x => x.Month == month && x.Year == year)
                .Select(x => new NamedKpi("sf", x.Id, x.Kpi ?? string.Empty))
                .ToListAsync();

            var allNamedKpis = ipKpis
                .Concat(bbKpis)
                .Concat(otn1Kpis)
                .Concat(otn2Kpis)
                .Concat(sfKpis)
                .ToList();

            var ipMetrics = await _db.IpNwOpKpiMetrics.AsNoTracking()
                .Where(x => x.Month == month && x.Year == year)
                .ToListAsync();
            var bbMetrics = await _db.BbAnwKpiNodes.AsNoTracking()
                .Where(x => x.Month == month && x.Year == year)
                .ToListAsync();
            var otn1Metrics = await _db.OtnOp1Metrics.AsNoTracking()
                .Where(x => x.Month == month && x.Year == year)
                .ToListAsync();
            var otn2Metrics = await _db.OtnOp2Metrics.AsNoTracking()
                .Where(x => x.Month == month && x.Year == year)
                .ToListAsync();
            var sfMetrics = await _db.ServiceFulfilmentKpiMetrics.AsNoTracking()
                .Where(x => x.Month == month && x.Year == year)
                .ToListAsync();

            var daysInMonth = DateTime.DaysInMonth(year, month);
            var results = new List<OverallKpiResult>();
            var nowUtc = DateTime.UtcNow;

            foreach (var kpi in kpis)
            {
                var matchedKpi = FindBestMatch(kpi.KeyPerformanceIndicators, allNamedKpis);
                var snapshots = BuildAreaSnapshots(matchedKpi, ipMetrics, bbMetrics, otn1Metrics, otn2Metrics, sfMetrics, daysInMonth);

                var areaSnapshots = normalizedAreas
                    .Select(area => (area, snapshot: FindSnapshotForArea(snapshots, NormalizeArea(area))))
                    .ToList();

                bool hasNodeBasedWeight = areaSnapshots.Any(x => (x.snapshot?.TotalNodes ?? 0m) > 0m);
                decimal totalNodes = hasNodeBasedWeight
                    ? areaSnapshots.Sum(x => x.snapshot?.TotalNodes ?? 0m)
                    : 0m;
                decimal equalShare = normalizedAreas.Count > 0
                    ? (decimal)kpi.PointsApplicable / normalizedAreas.Count
                    : 0m;

                foreach (var (area, snapshot) in areaSnapshots)
                {
                    var achieved = Math.Round(Math.Clamp(snapshot?.Achieved ?? 0m, 0m, 100m), 4);
                    var maxPoints = hasNodeBasedWeight && totalNodes > 0m
                        ? Math.Round(((decimal)kpi.PointsApplicable * (snapshot?.TotalNodes ?? 0m)) / totalNodes, 4)
                        : Math.Round(equalShare, 4);
                    
                    // Calculate pointsAchieved based on target value
                    var targetValue = TryParseTargetValue(kpi.DescriptionOfKPI);
                    var pointsAchieved = CalculatePointsAchieved(maxPoints, achieved, targetValue);

                    results.Add(new OverallKpiResult
                    {
                        KpiCode = $"KPI-{kpi.Id}",
                        KpiDefinitionId = kpi.Id,
                        KpiName = kpi.KeyPerformanceIndicators,
                        Platform = kpi.Perspectives,
                        AreaCode = area,
                        TargetValue = targetValue,
                        AchievedKpi = achieved,
                        MaximumPointsPerKpi = maxPoints,
                        PointsAchieved = pointsAchieved,
                        Month = month,
                        Year = year,
                        CalculatedAt = nowUtc
                    });
                }
            }

            var overallPercentByArea = results
                .GroupBy(x => x.AreaCode, StringComparer.OrdinalIgnoreCase)
                .ToDictionary(
                    g => g.Key,
                    g =>
                    {
                        var totalMax = g.Sum(x => x.MaximumPointsPerKpi);
                        var totalAchieved = g.Sum(x => x.PointsAchieved);
                        return totalMax > 0m
                            ? Math.Round((totalAchieved / totalMax) * 100m, 4)
                            : 0m;
                    },
                    StringComparer.OrdinalIgnoreCase);

            foreach (var row in results)
            {
                if (overallPercentByArea.TryGetValue(row.AreaCode, out var percent))
                {
                    row.OverallKpiValuePercent = percent;
                }
            }

            var existing = await _db.OverallKpiResults
                .Where(x => x.Month == month && x.Year == year)
                .ToListAsync();

            if (existing.Any())
            {
                _db.OverallKpiResults.RemoveRange(existing);
            }

            _db.OverallKpiResults.AddRange(results);
            await _db.SaveChangesAsync();

            return results
                .OrderBy(x => x.KpiDefinitionId)
                .ThenBy(x => x.AreaCode)
                .ToList();
        }

        private static Dictionary<string, AreaSnapshot> BuildAreaSnapshots(
            NamedKpi? matchedKpi,
            List<IpNwOpKpiMetric> ipMetrics,
            List<BbAnwKpiNode> bbMetrics,
            List<OtnOp1Metrics> otn1Metrics,
            List<OtnOp2Metrics> otn2Metrics,
            List<ServiceFulfilmentKpiMetric> sfMetrics,
            int daysInMonth)
        {
            var result = new Dictionary<string, AreaSnapshot>();
            if (matchedKpi == null) return result;

            if (matchedKpi.Source == "ip")
            {
                foreach (var row in ipMetrics.Where(x => x.IpNwOpKpiId == matchedKpi.Id))
                {
                    var area = NormalizeArea(row.AreaCode);
                    if (area == string.Empty) continue;
                    var achieved = CalculateAvailability(row.TotalMinutes, row.UnavailableMinutes, row.TotalNodes, daysInMonth);
                    result[area] = new AreaSnapshot(achieved, row.TotalNodes ?? 0);
                }
                return result;
            }

            if (matchedKpi.Source == "bb")
            {
                foreach (var row in bbMetrics.Where(x => x.BbAnwKpiId == matchedKpi.Id))
                {
                    var area = NormalizeArea(row.NodeCode);
                    if (area == string.Empty) continue;
                    var achieved = CalculateAvailability(row.TotalMinutes, row.UnavailableMinutes, row.TotalNodes, daysInMonth);
                    result[area] = new AreaSnapshot(achieved, row.TotalNodes ?? 0);
                }
                return result;
            }

            if (matchedKpi.Source == "otn1")
            {
                foreach (var row in otn1Metrics.Where(x => x.OtnOp1Id == matchedKpi.Id))
                {
                    var area = NormalizeArea(row.Site);
                    if (area == string.Empty) continue;
                    var achieved = CalculateAvailability(row.TotalMinutes, row.UnavailableMinutes, row.TotalNodes, daysInMonth);
                    result[area] = new AreaSnapshot(achieved, row.TotalNodes);
                }
                return result;
            }

            if (matchedKpi.Source == "otn2")
            {
                foreach (var row in otn2Metrics.Where(x => x.OtnOp2Id == matchedKpi.Id))
                {
                    var area = NormalizeArea(row.Site);
                    if (area == string.Empty) continue;
                    var achieved = CalculateSlaRatio(row.TotalFailedLinks, row.LinksSlaNotViolated);
                    result[area] = new AreaSnapshot(achieved, row.TotalFailedLinks);
                }
                return result;
            }

            foreach (var row in sfMetrics.Where(x => x.ServiceFulfilmentKpiId == matchedKpi.Id))
            {
                var area = NormalizeArea(row.AreaCode);
                if (area == string.Empty) continue;
                var achieved = Math.Clamp(row.KpiValue ?? 0m, 0m, 100m);
                result[area] = new AreaSnapshot(achieved, 0);
            }
            return result;
        }

        private static NamedKpi? FindBestMatch(string kpiName, List<NamedKpi> sourceKpis)
        {
            var normalizedTarget = NormalizeText(kpiName);
            if (normalizedTarget == string.Empty) return null;

            NamedKpi? best = null;
            decimal bestScore = 0m;

            foreach (var candidate in sourceKpis)
            {
                var score = Score(normalizedTarget, NormalizeText(candidate.Name));
                if (score > bestScore)
                {
                    bestScore = score;
                    best = candidate;
                }
            }

            return bestScore >= 35m ? best : null;
        }

        private static decimal Score(string target, string candidate)
        {
            if (target == string.Empty || candidate == string.Empty) return 0m;
            var targetCompact = target.Replace(" ", string.Empty);
            var candidateCompact = candidate.Replace(" ", string.Empty);

            if (targetCompact == candidateCompact) return 100m;
            if (targetCompact.Contains(candidateCompact) || candidateCompact.Contains(targetCompact)) return 85m;

            var targetTokens = Tokenize(target);
            var candidateTokens = Tokenize(candidate);
            if (!targetTokens.Any() || !candidateTokens.Any()) return 0m;

            var overlap = targetTokens.Intersect(candidateTokens).Count();
            if (overlap == 0) return 0m;

            var ratio = (decimal)(2 * overlap) / (targetTokens.Count + candidateTokens.Count);
            return ratio * 100m;
        }

        private static AreaSnapshot? FindSnapshotForArea(Dictionary<string, AreaSnapshot> snapshots, string normalizedArea)
        {
            if (normalizedArea == string.Empty || snapshots.Count == 0) return null;
            if (snapshots.TryGetValue(normalizedArea, out var exact)) return exact;

            var partial = snapshots
                .Where(kv => kv.Key.Contains(normalizedArea) || normalizedArea.Contains(kv.Key))
                .OrderByDescending(kv => CommonPrefixLength(kv.Key, normalizedArea))
                .Select(kv => (AreaSnapshot?)kv.Value)
                .FirstOrDefault();

            return partial;
        }

        private static int CommonPrefixLength(string a, string b)
        {
            var len = Math.Min(a.Length, b.Length);
            int i = 0;
            while (i < len && a[i] == b[i]) i++;
            return i;
        }

        private static decimal CalculateAvailability(long? totalMinutes, int? unavailableMinutes, int? totalNodes, int daysInMonth)
        {
            decimal tm = totalMinutes ?? 0;
            decimal um = unavailableMinutes ?? 0;
            decimal tn = totalNodes ?? 0;

            var denominator = 24m * 60m * daysInMonth * tn;
            if (denominator <= 0m) return 100m;

            var numerator = tm - um;
            var pct = (numerator / denominator) * 100m;
            return Math.Clamp(pct, 0m, 100m);
        }

        private static decimal CalculateAvailability(int totalMinutes, int unavailableMinutes, int totalNodes, int daysInMonth)
            => CalculateAvailability((long)totalMinutes, unavailableMinutes, totalNodes, daysInMonth);

        private static decimal CalculateSlaRatio(int totalFailedLinks, int linksSlaNotViolated)
        {
            if (totalFailedLinks <= 0) return 100m;
            var pct = ((decimal)linksSlaNotViolated / totalFailedLinks) * 100m;
            return Math.Clamp(pct, 0m, 100m);
        }

        private static string NormalizeText(string value)
            => Regex.Replace(value ?? string.Empty, "[^A-Za-z0-9]+", " ").Trim().ToLowerInvariant();

        private static string NormalizeArea(string value)
            => Regex.Replace(value ?? string.Empty, "[^A-Za-z0-9]+", "").ToLowerInvariant();

        private static List<string> Tokenize(string normalized)
        {
            var raw = Regex.Replace(normalized ?? string.Empty, "([a-z])([A-Z])", "$1 $2");
            return Regex.Split(raw, @"[^A-Za-z0-9]+")
                .Where(x => x.Trim().Length >= 2)
                .Select(x => x.Trim().ToLowerInvariant())
                .Distinct()
                .ToList();
        }

        private static OverallKpiResultDto ToDto(OverallKpiResult x) => new()
        {
            Id = x.Id,
            KpiDefinitionId = x.KpiDefinitionId,
            KpiName = x.KpiName,
            AreaCode = x.AreaCode,
            AchievedKpi = x.AchievedKpi,
            MaximumPointsPerKpi = x.MaximumPointsPerKpi,
            PointsAchieved = x.PointsAchieved,
            OverallKpiValuePercent = x.OverallKpiValuePercent,
            Month = x.Month,
            Year = x.Year
        };

        private sealed record NamedKpi(string Source, int Id, string Name);
        private sealed record AreaSnapshot(decimal Achieved, decimal TotalNodes);

        private static decimal CalculatePointsAchieved(decimal maxPoints, decimal achieved, decimal? targetValue)
        {
            // If no target value or target is 0 or negative, use simple linear scaling: points = maxPoints * achieved / 100
            if (!targetValue.HasValue || targetValue.Value <= 0)
            {
                return Math.Round((maxPoints * achieved) / 100m, 4);
            }

            // Target-based formula:
            // If achieved > target: pointsAchieved = maxPoints
            // Else: pointsAchieved = maxPoints * achieved / target
            var target = targetValue.Value;
            var points = achieved > target
                ? maxPoints
                : Math.Round((maxPoints * achieved) / target, 4);

            return points;
        }

        private static decimal? TryParseTargetValue(string? text)
        {
            if (string.IsNullOrWhiteSpace(text)) return null;
            var m = Regex.Match(text, @"\d+(\.\d+)?");
            if (!m.Success) return null;
            return decimal.TryParse(m.Value, out var value) ? value : null;
        }
    }
}
