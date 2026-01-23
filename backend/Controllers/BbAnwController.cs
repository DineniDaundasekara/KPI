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
    [Route("api/bb-anw")]
    public class BbAnwController : ControllerBase
    {
        private readonly AppDbContext _context;

        public BbAnwController(AppDbContext context)
        {
            _context = context;
        }

        // =========================================================
        // PLATFORM KPI PAGE (FULL DATA: HEADERS + NODES)
        // =========================================================

        // GET: /api/bb-anw  (FULL)
        [HttpGet]
        public async Task<IActionResult> GetAll()
        {
            var data = await _context.BbAnwKpis
                .AsNoTracking()
                .Include(x => x.Nodes)
                .OrderBy(x => x.No)
                .Select(x => new BbAnwDto
                {
                    KpiId = x.KpiId,
                    MongoObjectId = x.MongoObjectId,
                    No = x.No,
                    NetworkEngineerKpi = x.NetworkEngineerKpi,
                    Division = x.Division,
                    Section = x.Section,
                    KpiPercent = x.KpiPercent,
                    Nodes = x.Nodes.Select(n => new BbAnwNodeDto
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

        // GET: /api/bb-anw/{kpiId} (FULL)
        [HttpGet("{kpiId:guid}")]
        public async Task<IActionResult> GetById(Guid kpiId)
        {
            var item = await _context.BbAnwKpis
                .AsNoTracking()
                .Include(x => x.Nodes)
                .Where(x => x.KpiId == kpiId)
                .Select(x => new BbAnwDto
                {
                    KpiId = x.KpiId,
                    MongoObjectId = x.MongoObjectId,
                    No = x.No,
                    NetworkEngineerKpi = x.NetworkEngineerKpi,
                    Division = x.Division,
                    Section = x.Section,
                    KpiPercent = x.KpiPercent,
                    Nodes = x.Nodes.Select(n => new BbAnwNodeDto
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

        // POST: /api/bb-anw/add  (FULL INSERT header + nodes)
        [HttpPost("add")]
        public async Task<IActionResult> Add([FromBody] BbAnwDto dto)
        {
            if (dto == null) return BadRequest("Body is empty.");

            // guard: duplicate node codes
            var duplicateNode = (dto.Nodes ?? new())
                .GroupBy(n => n.NodeCode?.Trim().ToLower())
                .FirstOrDefault(g => !string.IsNullOrWhiteSpace(g.Key) && g.Count() > 1);

            if (duplicateNode != null)
                return BadRequest($"Duplicate NodeCode found: {duplicateNode.Key}");

            var header = new BbAnwKpi
            {
                KpiId = Guid.NewGuid(),
                MongoObjectId = dto.MongoObjectId,
                No = dto.No,
                NetworkEngineerKpi = dto.NetworkEngineerKpi,
                Division = dto.Division,
                Section = dto.Section,
                KpiPercent = dto.KpiPercent
            };

            header.Nodes = (dto.Nodes ?? new()).Select(n => new BbAnwKpiNode
            {
                KpiId = header.KpiId,
                NodeCode = (n.NodeCode ?? "").Trim(),
                UnavailableMinutes = n.UnavailableMinutes,
                TotalMinutes = n.TotalMinutes,
                TotalNodes = n.TotalNodes
            }).ToList();

            _context.BbAnwKpis.Add(header);
            await _context.SaveChangesAsync();

            return Ok(new { header.KpiId });
        }

        // PUT: /api/bb-anw/update/{kpiId}  (FULL replace nodes)
        [HttpPut("update/{kpiId:guid}")]
        public async Task<IActionResult> Update(Guid kpiId, [FromBody] BbAnwDto dto)
        {
            if (dto == null) return BadRequest("Body is empty.");

            var header = await _context.BbAnwKpis
                .Include(x => x.Nodes)
                .FirstOrDefaultAsync(x => x.KpiId == kpiId);

            if (header == null) return NotFound();

            // guard: duplicate node codes
            var duplicateNode = (dto.Nodes ?? new())
                .GroupBy(n => n.NodeCode?.Trim().ToLower())
                .FirstOrDefault(g => !string.IsNullOrWhiteSpace(g.Key) && g.Count() > 1);

            if (duplicateNode != null)
                return BadRequest($"Duplicate NodeCode found: {duplicateNode.Key}");

            header.MongoObjectId = dto.MongoObjectId;
            header.No = dto.No;
            header.NetworkEngineerKpi = dto.NetworkEngineerKpi;
            header.Division = dto.Division;
            header.Section = dto.Section;
            header.KpiPercent = dto.KpiPercent;

            // remove old nodes then add new nodes
            _context.BbAnwKpiNodes.RemoveRange(header.Nodes);

            header.Nodes = (dto.Nodes ?? new()).Select(n => new BbAnwKpiNode
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

        // DELETE: /api/bb-anw/delete/{kpiId}
        [HttpDelete("delete/{kpiId:guid}")]
        public async Task<IActionResult> Delete(Guid kpiId)
        {
            var header = await _context.BbAnwKpis
                .Include(x => x.Nodes)
                .FirstOrDefaultAsync(x => x.KpiId == kpiId);

            if (header == null) return NotFound();

            _context.BbAnwKpiNodes.RemoveRange(header.Nodes);
            _context.BbAnwKpis.Remove(header);

            await _context.SaveChangesAsync();
            return Ok();
        }

        // =========================================================
        // ADMIN PAGE (HEADER ONLY CRUD) ✅ DOES NOT TOUCH NODES
        // =========================================================

        // GET: /api/bb-anw/headers
        [HttpGet("headers")]
        public async Task<IActionResult> GetHeaders()
        {
            var headers = await _context.BbAnwKpis
                .AsNoTracking()
                .OrderBy(x => x.No)
                .Select(x => new BbAnwHeaderDto
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

        // POST: /api/bb-anw/add-header
        [HttpPost("add-header")]
        public async Task<IActionResult> AddHeader([FromBody] BbAnwHeaderDto dto)
        {
            if (dto == null) return BadRequest("Body is empty.");

            var header = new BbAnwKpi
            {
                KpiId = Guid.NewGuid(),
                MongoObjectId = dto.MongoObjectId,
                No = dto.No,
                NetworkEngineerKpi = dto.NetworkEngineerKpi,
                Division = dto.Division,
                Section = dto.Section,
                KpiPercent = dto.KpiPercent
            };

            _context.BbAnwKpis.Add(header);
            await _context.SaveChangesAsync();

            return Ok(new { header.KpiId });
        }

        // PUT: /api/bb-anw/update-header/{kpiId}
        [HttpPut("update-header/{kpiId:guid}")]
        public async Task<IActionResult> UpdateHeader(Guid kpiId, [FromBody] BbAnwHeaderDto dto)
        {
            if (dto == null) return BadRequest("Body is empty.");

            var header = await _context.BbAnwKpis.FirstOrDefaultAsync(x => x.KpiId == kpiId);
            if (header == null) return NotFound();

            header.MongoObjectId = dto.MongoObjectId;
            header.No = dto.No;
            header.NetworkEngineerKpi = dto.NetworkEngineerKpi;
            header.Division = dto.Division;
            header.Section = dto.Section;
            header.KpiPercent = dto.KpiPercent;

            await _context.SaveChangesAsync();
            return Ok(new { header.KpiId });
        }
    }
}
