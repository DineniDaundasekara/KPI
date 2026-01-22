using backend.Data;
using backend.DTOs;
using backend.Models;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace backend.Controllers
{
    [ApiController]
    [Route("api/form7")]
    public class Form7Controller : ControllerBase
    {
        private readonly AppDbContext _context;

        public Form7Controller(AppDbContext context)
        {
            _context = context;
        }

        // =========================================================
        // PLATFORM KPI PAGE (FULL DATA: HEADERS + NODES)
        // =========================================================

        // GET: /api/form7  (FULL)
        [HttpGet]
        public async Task<IActionResult> GetAll()
        {
            var data = await _context.Form7Kpis
                .AsNoTracking()
                .Include(x => x.Nodes)
                .OrderBy(x => x.No)
                .Select(x => new Form7Dto
                {
                    KpiId = x.KpiId,
                    MongoObjectId = x.MongoObjectId,
                    No = x.No,
                    NetworkEngineerKpi = x.NetworkEngineerKpi,
                    Division = x.Division,
                    Section = x.Section,
                    KpiPercent = x.KpiPercent,
                    Nodes = x.Nodes.Select(n => new Form7NodeDto
                    {
                        NodeCode = n.NodeCode,
                        UnavailableMinutes = n.UnavailableMinutes,
                        TotalMinutes = n.TotalMinutes,
                        TotalNodes = n.TotalNodes
                    }).ToList()
                })
                .ToListAsync();

            return Ok(data);
        }

        // GET: /api/form7/{kpiId} (FULL)
        [HttpGet("{kpiId:guid}")]
        public async Task<IActionResult> GetById(Guid kpiId)
        {
            var item = await _context.Form7Kpis
                .AsNoTracking()
                .Include(x => x.Nodes)
                .Where(x => x.KpiId == kpiId)
                .Select(x => new Form7Dto
                {
                    KpiId = x.KpiId,
                    MongoObjectId = x.MongoObjectId,
                    No = x.No,
                    NetworkEngineerKpi = x.NetworkEngineerKpi,
                    Division = x.Division,
                    Section = x.Section,
                    KpiPercent = x.KpiPercent,
                    Nodes = x.Nodes.Select(n => new Form7NodeDto
                    {
                        NodeCode = n.NodeCode,
                        UnavailableMinutes = n.UnavailableMinutes,
                        TotalMinutes = n.TotalMinutes,
                        TotalNodes = n.TotalNodes
                    }).ToList()
                })
                .FirstOrDefaultAsync();

            if (item == null) return NotFound();
            return Ok(item);
        }

        // POST: /api/form7/add  (FULL INSERT header + nodes)
        [HttpPost("add")]
        public async Task<IActionResult> Add([FromBody] Form7Dto dto)
        {
            if (dto == null) return BadRequest("Body is empty.");

            // guard: duplicate node codes
            var duplicateNode = (dto.Nodes ?? new List<Form7NodeDto>())
                .GroupBy(n => n.NodeCode?.Trim().ToLower())
                .FirstOrDefault(g => !string.IsNullOrWhiteSpace(g.Key) && g.Count() > 1);

            if (duplicateNode != null)
                return BadRequest($"Duplicate NodeCode found: {duplicateNode.Key}");

            var header = new Form7Kpi
            {
                KpiId = Guid.NewGuid(),
                MongoObjectId = dto.MongoObjectId,
                No = dto.No,
                NetworkEngineerKpi = dto.NetworkEngineerKpi,
                Division = dto.Division ?? "",
                Section = dto.Section ?? "",
                KpiPercent = dto.KpiPercent ?? 0
            };

            header.Nodes = (dto.Nodes ?? new List<Form7NodeDto>()).Select(n => new Form7KpiNode
            {
                KpiId = header.KpiId,
                NodeCode = (n.NodeCode ?? "").Trim(),
                UnavailableMinutes = n.UnavailableMinutes,
                TotalMinutes = n.TotalMinutes,
                TotalNodes = n.TotalNodes
            }).ToList();

            _context.Form7Kpis.Add(header);
            await _context.SaveChangesAsync();

            return Ok(new { header.KpiId });
        }

        // PUT: /api/form7/update/{kpiId}  (FULL replace nodes)
        [HttpPut("update/{kpiId:guid}")]
        public async Task<IActionResult> Update(Guid kpiId, [FromBody] Form7Dto dto)
        {
            if (dto == null) return BadRequest("Body is empty.");

            var header = await _context.Form7Kpis
                .Include(x => x.Nodes)
                .FirstOrDefaultAsync(x => x.KpiId == kpiId);

            if (header == null) return NotFound();

            // guard: duplicate node codes
            var duplicateNode = (dto.Nodes ?? new List<Form7NodeDto>())
                .GroupBy(n => n.NodeCode?.Trim().ToLower())
                .FirstOrDefault(g => !string.IsNullOrWhiteSpace(g.Key) && g.Count() > 1);

            if (duplicateNode != null)
                return BadRequest($"Duplicate NodeCode found: {duplicateNode.Key}");

            header.MongoObjectId = dto.MongoObjectId;
            header.No = dto.No;
            header.NetworkEngineerKpi = dto.NetworkEngineerKpi;
            header.Division = dto.Division ?? "";
            header.Section = dto.Section ?? "";
            header.KpiPercent = dto.KpiPercent ?? header.KpiPercent;

            _context.Form7KpiNodes.RemoveRange(header.Nodes);

            header.Nodes = (dto.Nodes ?? new List<Form7NodeDto>()).Select(n => new Form7KpiNode
            {
                KpiId = header.KpiId,
                NodeCode = (n.NodeCode ?? "").Trim(),
                UnavailableMinutes = n.UnavailableMinutes,
                TotalMinutes = n.TotalMinutes,
                TotalNodes = n.TotalNodes
            }).ToList();

            await _context.SaveChangesAsync();
            return Ok(new { header.KpiId });
        }

        // DELETE: /api/form7/delete/{kpiId} (delete nodes + header)
        [HttpDelete("delete/{kpiId:guid}")]
        public async Task<IActionResult> Delete(Guid kpiId)
        {
            var header = await _context.Form7Kpis
                .Include(x => x.Nodes)
                .FirstOrDefaultAsync(x => x.KpiId == kpiId);

            if (header == null) return NotFound();

            _context.Form7KpiNodes.RemoveRange(header.Nodes);
            _context.Form7Kpis.Remove(header);

            await _context.SaveChangesAsync();
            return Ok();
        }

        // =========================================================
        // ADMIN PAGE (HEADER ONLY CRUD) ✅ DOES NOT TOUCH NODES
        // =========================================================

        // GET: /api/form7/headers (header-only list)
        [HttpGet("headers")]
        public async Task<IActionResult> GetHeaders()
        {
            var headers = await _context.Form7Kpis
                .AsNoTracking()
                .OrderBy(x => x.No)
                .Select(x => new Form7HeaderDto
                {
                    KpiId = x.KpiId,
                    MongoObjectId = x.MongoObjectId,
                    No = x.No,
                    NetworkEngineerKpi = x.NetworkEngineerKpi,
                    Division = x.Division,
                    Section = x.Section,
                    KpiPercent = x.KpiPercent
                })
                .ToListAsync();

            return Ok(headers);
        }

        // POST: /api/form7/add-header (insert header only)
        [HttpPost("add-header")]
        public async Task<IActionResult> AddHeader([FromBody] Form7HeaderDto dto)
        {
            if (dto == null) return BadRequest("Body is empty.");

            var header = new Form7Kpi
            {
                KpiId = Guid.NewGuid(),
                MongoObjectId = dto.MongoObjectId,
                No = dto.No,
                NetworkEngineerKpi = dto.NetworkEngineerKpi,
                Division = dto.Division ?? "",
                Section = dto.Section ?? "",
                KpiPercent = dto.KpiPercent ?? 0
            };

            _context.Form7Kpis.Add(header);
            await _context.SaveChangesAsync();

            return Ok(new { header.KpiId });
        }

        // PUT: /api/form7/update-header/{kpiId} (update header only)
        [HttpPut("update-header/{kpiId:guid}")]
        public async Task<IActionResult> UpdateHeader(Guid kpiId, [FromBody] Form7HeaderDto dto)
        {
            if (dto == null) return BadRequest("Body is empty.");

            var header = await _context.Form7Kpis.FirstOrDefaultAsync(x => x.KpiId == kpiId);
            if (header == null) return NotFound();

            header.MongoObjectId = dto.MongoObjectId;
            header.No = dto.No;
            header.NetworkEngineerKpi = dto.NetworkEngineerKpi;
            header.Division = dto.Division ?? "";
            header.Section = dto.Section ?? "";
            header.KpiPercent = dto.KpiPercent ?? header.KpiPercent;

            await _context.SaveChangesAsync();
            return Ok(new { header.KpiId });
        }
    }
}
