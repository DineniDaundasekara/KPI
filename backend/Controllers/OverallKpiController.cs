using backend.Data;
using backend.Helpers.Calculations;
using backend.Models;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace backend.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class OverallKpiController : ControllerBase
    {
        private readonly AppDbContext _context;
        private readonly ILogger<OverallKpiController> _logger;

        public OverallKpiController(AppDbContext context, ILogger<OverallKpiController> logger)
        {
            _context = context;
            _logger = logger;
        }

        // ==========================================
        // GET: /api/OverallKpi?year=2025&month=1&areaCode=CENHK
        // ==========================================
        [HttpGet]
        public async Task<ActionResult<IEnumerable<OverallKpiResult>>> GetOverallKpis(
            [FromQuery] short year,
            [FromQuery] byte month,
            [FromQuery] string areaCode,
            [FromQuery] string? platform = null)
        {
            var query = _context.OverallKpiResults
                .Where(x => x.Year == year && x.Month == month && x.AreaCode == areaCode);

            if (!string.IsNullOrEmpty(platform))
            {
                query = query.Where(x => x.Platform == platform);
            }

            return await query.ToListAsync();
        }

        // ==========================================
        // POST: /api/OverallKpi/recalculate-otn
        // RECALCULATE OTN OP1 & OTN OP2
        // ==========================================
        [HttpPost("recalculate-otn")]
        public async Task<IActionResult> RecalculateOtn([FromQuery] short year, [FromQuery] byte month, [FromQuery] string areaCode)
        {
            // 1. OTN OP1 (Availability)
            var kpiDefOp1 = await _context.KpiDefinitions
                .FirstOrDefaultAsync(k => k.Year == year && k.Month == month && k.KeyPerformanceIndicators.Contains("Availability")); // "Availability" is key for OTN OP1? Checking task: "OTN OP1 (Availability)"

            if (kpiDefOp1 != null)
            {
                // Fetch metrics for this area
                var metrics = await _context.OtnOp1Metrics
                    .Where(m => m.Year == year && m.Month == month && m.Site == areaCode) // Using Site as AreaCode for OTN logic? User said "RTOM AREA (areaCode) selected in frontend (example CENHK...)"
                    .ToListAsync();
                
                // If no metrics found for Site, we might need to verify if Site maps to AreaCode. 
                // Assuming direct match for now based on context "RTOM AREA... selected... example CENHK".

                decimal target = TargetParser.ParseTarget(kpiDefOp1.DescriptionOfKPI);
                var (achieved, points) = OtnOp1Calc.Calculate(metrics, target, kpiDefOp1.PointsApplicable);

                await UpsertResult(kpiDefOp1, areaCode, "OTN_OP1", target, achieved, points);
            }

            // 2. OTN OP2 (Fiber Failures)
            var kpiDefOp2 = await _context.KpiDefinitions
                .FirstOrDefaultAsync(k => k.Year == year && k.Month == month && k.KeyPerformanceIndicators.Contains("Fiber Failures"));

            if (kpiDefOp2 != null)
            {
                 var metrics = await _context.OtnOp2Metrics
                    .Where(m => m.Year == year && m.Month == month && m.Site == areaCode)
                    .ToListAsync();

                decimal target = TargetParser.ParseTarget(kpiDefOp2.DescriptionOfKPI);
                var (achieved, points) = OtnOp2Calc.Calculate(metrics, target, kpiDefOp2.PointsApplicable);

                await UpsertResult(kpiDefOp2, areaCode, "OTN_OP2", target, achieved, points);
            }

            await _context.SaveChangesAsync();
            return Ok(new { message = "OTN KPI Recalculated" });
        }

        // ==========================================
        // POST: /api/OverallKpi/recalculate-ipnw
        // RECALCULATE IP NW OPS (Multiple KPIs)
        // ==========================================
        [HttpPost("recalculate-ipnw")]
        public async Task<IActionResult> RecalculateIpNw([FromQuery] short year, [FromQuery] byte month, [FromQuery] string areaCode)
        {
            // IP NW OP has multiple KPIs potentially. User mentioned:
            // "IP Core NW Availability / BSR NW Availability / Service Edge NW Availability"
            
            // We need to loop through relevant definitions.
            var kpiDefs = await _context.KpiDefinitions
                .Where(k => k.Year == year && k.Month == month && 
                           (k.KeyPerformanceIndicators.Contains("IP Core NW") || 
                            k.KeyPerformanceIndicators.Contains("BSR NW") || 
                            k.KeyPerformanceIndicators.Contains("Service Edge")))
                .ToListAsync();

            foreach (var def in kpiDefs)
            {
                // Find matching metric by KPI ID maybe?
                // The IpNwOpKpiMetric links to IpNwOpKpi, not directly to KpiDefinition ID.
                // WE match by NAME? Or is there a link? 
                
                // User said: Match KPI definition row by KeyPerformanceIndicators == KPI name
                // AND Match KPI metric row by RTOM AREA.
                
                // ISSUE: IpNwOpMetrics are linked to `IpNwOpKpi` parent table. `IpNwOpKpi` has `NetworkEngineerKpi`.
                // We should match `KpiDefinition.KeyPerformanceIndicators` ~ `IpNwOpKpi.NetworkEngineerKpi`?
                // OR `KpiDefinition.KeyPerformanceIndicators` name is enough to identify what we are calculating?
                
                // User said: "Use IpNwOpMetrics columns... If your IpNwOp metric already stores availability percent..."
                
                // Strategy:
                // 1. Get definitions from `finaldatatables` (KpiDefinition)
                // 2. For each, try to find corresponding data in `IpNwOpKpi` + `Metrics`.
                //    Link: `IpNwOpKpi.NetworkEngineerKpi` == `def.KeyPerformanceIndicators`?
                
                var ipNwOpKpi = await _context.IpNwOpKpis
                    .Include(k => k.Metrics)
                    .Where(k => (k.NetworkEngineerKpi == def.KeyPerformanceIndicators || k.NetworkEngineerKpi.Contains(def.KeyPerformanceIndicators))) 
                    .FirstOrDefaultAsync();

                if (ipNwOpKpi != null)
                {
                    var metrics = ipNwOpKpi.Metrics
                        .Where(m => m.Year == year && m.Month == month && m.AreaCode == areaCode)
                        .ToList();

                    decimal target = TargetParser.ParseTarget(def.DescriptionOfKPI);
                    var (achieved, points) = IpNwOpCalc.Calculate(metrics, target, def.PointsApplicable);

                    await UpsertResult(def, areaCode, "IP_NW_OP", target, achieved, points);
                }
            }

            await _context.SaveChangesAsync();
            return Ok(new { message = "IP NW OP Recalculated" });
        }

        // ==========================================
        // POST: /api/OverallKpi/recalculate-servicefulfilment
        // ==========================================
        [HttpPost("recalculate-servicefulfilment")]
        public async Task<IActionResult> RecalculateServiceFulfilment([FromQuery] short year, [FromQuery] byte month, [FromQuery] string areaCode)
        {
            var kpiDefs = await _context.KpiDefinitions
                .Where(k => k.Year == year && k.Month == month && 
                           (k.KeyPerformanceIndicators.Contains("Service Fulfilment") || k.Perspectives.Contains("Service Fulfilment"))) 
                .ToListAsync();

             if (!kpiDefs.Any())
             {
                 // Try loose search if strict match failed
                 kpiDefs = await _context.KpiDefinitions
                    .Where(k => k.Year == year && k.Month == month && k.KeyPerformanceIndicators.Contains("Fulfillment")) 
                    .ToListAsync();
             }

             foreach (var def in kpiDefs)
             {
                 var sfKpi = await _context.ServiceFulfilmentKpis
                     .Include(k => k.Metrics)
                     .Where(k => k.Kpi == def.KeyPerformanceIndicators)
                     .FirstOrDefaultAsync();

                 if (sfKpi != null)
                 {
                     var metrics = sfKpi.Metrics
                         .Where(m => m.Year == year && m.Month == month && m.AreaCode == areaCode)
                         .ToList();

                     decimal target = TargetParser.ParseTarget(def.DescriptionOfKPI);
                     var (achieved, points) = ServiceFulfilmentCalc.Calculate(metrics, target, def.PointsApplicable);

                     await UpsertResult(def, areaCode, "SERVICE_FULFILMENT", target, achieved, points);
                 }
             }

            await _context.SaveChangesAsync();
            return Ok(new { message = "Service Fulfilment Recalculated" });
        }


        // ==========================================
        // GET: /api/OverallKpi/results-matrix?year=...&month=...
        // Returns flat list of results for easier frontend mapping
        // ==========================================
        [HttpGet("results-matrix")]
        public async Task<ActionResult<IEnumerable<object>>> GetResultsMatrix(
            [FromQuery] short year, 
            [FromQuery] byte month)
        {
            try 
            {
                // 1. Fetch raw data (LINQ-to-Entities)
                // Note: Ensure column names match DB. If 500 error persists, check column Mapping in OverallKpiResult.cs
                var rawResults = await _context.OverallKpiResults
                    .Where(x => x.Year == year && x.Month == month)
                    .Select(x => new 
                    {
                        x.KpiCode,
                        x.AreaCode,
                        x.Achieved,
                        x.PointsAchieved,
                        x.Target
                    })
                    .ToListAsync();

                // 2. Transform in memory (LINQ-to-Objects)
                var results = rawResults.Select(x => new 
                {
                    KpiId = ParseKpiId(x.KpiCode), 
                    x.AreaCode,
                    x.Achieved,
                    x.PointsAchieved,
                    x.Target
                });

                return Ok(results);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error getting results matrix for {Year}-{Month}", year, month);
                // Return detailed error for debugging purposes (remove in production)
                return StatusCode(500, new { message = ex.Message, details = ex.ToString() });
            }
        }

        private int ParseKpiId(string kpiCode)
        {
            if (string.IsNullOrEmpty(kpiCode)) return 0;
            // Handle "FINAL_123" -> 123
            var part = kpiCode.Replace("FINAL_", "");
            if (int.TryParse(part, out int id))
            {
                return id;
            }
            return 0; // Fallback
        }

        [HttpPost("fix-schema")]
        public async Task<IActionResult> FixSchema()
        {
            try
            {
                var sql = @"
                IF OBJECT_ID(N'[dbo].[OverallKpiResult]', N'U') IS NULL
                BEGIN
                    CREATE TABLE [dbo].[OverallKpiResult] (
                        [id] int NOT NULL IDENTITY,
                        [kpi_code] nvarchar(100) NOT NULL,
                        [area_code] nvarchar(50) NOT NULL,
                        [month] tinyint NOT NULL,
                        [year] smallint NOT NULL,
                        [platform] nvarchar(50) NOT NULL,
                        [target] decimal(18,5) NOT NULL,
                        [achieved] decimal(18,5) NOT NULL,
                        [points_applicable] int NOT NULL,
                        [points_achieved] decimal(18,5) NOT NULL,
                        [updated_at] datetime2 NOT NULL,
                        CONSTRAINT [PK_OverallKpiResult] PRIMARY KEY ([id])
                    );
                END;

                IF NOT EXISTS(SELECT * FROM sys.indexes WHERE name = 'UQ_OverallKpiResult_Key' AND object_ID = OBJECT_ID('dbo.OverallKpiResult'))
                BEGIN
                    CREATE UNIQUE INDEX [UQ_OverallKpiResult_Key] ON [dbo].[OverallKpiResult] ([kpi_code], [area_code], [year], [month]);
                END;
                ";

                await _context.Database.ExecuteSqlRawAsync(sql);
                return Ok(new { message = "Schema fixed successfully" });
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { message = ex.Message });
            }
        }

        //Helper to Upsert
        private async Task UpsertResult(KpiDefinition def, string areaCode, string platform, decimal target, decimal achieved, decimal points)
        {
            string kpiCode = "FINAL_" + def.Id;

            var existing = await _context.OverallKpiResults
                //.FirstOrDefaultAsync(x => x.KpiCode == kpiCode && x.AreaCode == areaCode && x.Year == def.Year && x.Month == def.Month); // Optimization: composite key loop
                .FirstOrDefaultAsync(x => x.KpiCode == kpiCode && x.AreaCode == areaCode && x.Year == def.Year && x.Month == def.Month);

            if (existing != null)
            {
                existing.Target = target;
                existing.Achieved = achieved;
                existing.PointsApplicable = def.PointsApplicable;
                existing.PointsAchieved = points;
                existing.Platform = platform;
                existing.UpdatedAt = DateTime.UtcNow;
                _context.OverallKpiResults.Update(existing);
            }
            else
            {
                var newResult = new OverallKpiResult
                {
                    KpiCode = kpiCode,
                    AreaCode = areaCode,
                    Year = def.Year,
                    Month = def.Month,
                    Platform = platform,
                    Target = target,
                    Achieved = achieved,
                    PointsApplicable = def.PointsApplicable,
                    PointsAchieved = points,
                    UpdatedAt = DateTime.UtcNow
                };
                await _context.OverallKpiResults.AddAsync(newResult);
            }
        }
    }
}
