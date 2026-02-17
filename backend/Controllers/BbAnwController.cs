using System.Linq;
using System.Threading.Tasks;
using backend.Data;
using backend.DTOs;
using backend.Models;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

using Microsoft.AspNetCore.Authorization;
using backend.Helpers.Authorization;

namespace backend.Controllers
{
    [ApiController]
    [Route("api/bb-anw")]
    [Authorize]
    public class BbAnwController : ControllerBase
    {
        private readonly AppDbContext _context;
        private readonly IAuthorizationService _authorizationService;
        private const int PageId = 3; // BB ANW

        public BbAnwController(AppDbContext context, IAuthorizationService authorizationService)
        {
            _context = context;
            _authorizationService = authorizationService;
        }

        // =========================================================
        // PLATFORM KPI PAGE (FULL DATA: HEADERS + NODES)
        // =========================================================

        // GET: /api/bb-anw  (FULL)
        [HttpGet]
        public async Task<IActionResult> GetAll()
        {
            var authResult = await _authorizationService.AuthorizeAsync(User, PageId, "ViewPagePolicy");
            if (!authResult.Succeeded) return Forbid();

            var data = await _context.BbAnwKpis
                .AsNoTracking()
                .Include(x => x.Nodes)
                .OrderBy(x => x.Id)
                .Select(x => new BbAnwDto
                {
                    Id = x.Id,
                    NetworkEngineerKpi = x.NetworkEngineerKpi,
                    Division = x.Division,
                    Section = x.Section,
                    KpiPercent = x.KpiPercent,
                    Nodes = x.Nodes.Select(n => new BbAnwNodeDto
                    {
                        NodeCode = n.NodeCode,
                        UnavailableMinutes = n.UnavailableMinutes,
                        TotalMinutes = n.TotalMinutes,
                        TotalNodes = n.TotalNodes,
                        Month = n.Month,
                        Year = n.Year
                    }).ToList()
                })
                .ToListAsync();

            return Ok(data);
        }

        // GET: /api/bb-anw/{id} (FULL)
        [HttpGet("{id:int}")]
        public async Task<IActionResult> GetById(int id)
        {
            var authResult = await _authorizationService.AuthorizeAsync(User, PageId, "ViewPagePolicy");
            if (!authResult.Succeeded) return Forbid();

            var item = await _context.BbAnwKpis
                .AsNoTracking()
                .Include(x => x.Nodes)
                .Where(x => x.Id == id)
                .Select(x => new BbAnwDto
                {
                    Id = x.Id,
                    NetworkEngineerKpi = x.NetworkEngineerKpi,
                    Division = x.Division,
                    Section = x.Section,
                    KpiPercent = x.KpiPercent,
                    Nodes = x.Nodes.Select(n => new BbAnwNodeDto
                    {
                        NodeCode = n.NodeCode,
                        UnavailableMinutes = n.UnavailableMinutes,
                        TotalMinutes = n.TotalMinutes,
                        TotalNodes = n.TotalNodes,
                        Month = n.Month,
                        Year = n.Year
                    }).ToList()
                })
                .FirstOrDefaultAsync();

            if (item == null) return NotFound();
            return Ok(item);
        }

        // POST: /api/bb-anw/add  (FULL INSERT header + nodes)
        [HttpPost("add")]
        [Authorize(Policy = "AdminOnly")]
        public async Task<IActionResult> Add([FromBody] BbAnwDto dto)
        {
            if (dto == null) return BadRequest("Body is empty.");

            // guard: duplicate (node_code + month + year)
            var duplicate = (dto.Nodes ?? new())
                .Select(n => new
                {
                    Node = (n.NodeCode ?? "").Trim().ToLower(),
                    n.Month,
                    n.Year
                })
                .GroupBy(x => new { x.Node, x.Month, x.Year })
                .FirstOrDefault(g => !string.IsNullOrWhiteSpace(g.Key.Node) && g.Count() > 1);

            if (duplicate != null)
                return BadRequest($"Duplicate node/month/year found: {duplicate.Key.Node}, {duplicate.Key.Month}/{duplicate.Key.Year}");

            var header = new BbAnwKpi
            {
                NetworkEngineerKpi = dto.NetworkEngineerKpi,
                Division = dto.Division,
                Section = dto.Section,
                KpiPercent = dto.KpiPercent
            };

            _context.BbAnwKpis.Add(header);
            await _context.SaveChangesAsync(); // ✅ get header.Id

            var nodes = (dto.Nodes ?? new()).Select(n => new BbAnwKpiNode
            {
                BbAnwKpiId = header.Id,
                NodeCode = (n.NodeCode ?? "").Trim(),
                UnavailableMinutes = n.UnavailableMinutes,
                TotalMinutes = n.TotalMinutes,
                TotalNodes = n.TotalNodes,
                Month = n.Month,
                Year = n.Year
            }).ToList();

            _context.BbAnwKpiNodes.AddRange(nodes);
            await _context.SaveChangesAsync();

            return Ok(new { header.Id });
        }

        // PUT: /api/bb-anw/update/{id}  (FULL replace nodes)
        [HttpPut("update/{id:int}")]
        public async Task<IActionResult> Update(int id, [FromBody] BbAnwDto dto)
        {
            // Update whole form -> PlatformAdmin
            var authResult = await _authorizationService.AuthorizeAsync(User, PageId, "EditPlatformKpiPolicy");
            if (!authResult.Succeeded) return Forbid();

            if (dto == null) return BadRequest("Body is empty.");

            var header = await _context.BbAnwKpis
                .Include(x => x.Nodes)
                .FirstOrDefaultAsync(x => x.Id == id);

            if (header == null) return NotFound();

            // guard: duplicate (node_code + month + year)
            var duplicate = (dto.Nodes ?? new())
                .Select(n => new
                {
                    Node = (n.NodeCode ?? "").Trim().ToLower(),
                    n.Month,
                    n.Year
                })
                .GroupBy(x => new { x.Node, x.Month, x.Year })
                .FirstOrDefault(g => !string.IsNullOrWhiteSpace(g.Key.Node) && g.Count() > 1);

            if (duplicate != null)
                return BadRequest($"Duplicate node/month/year found: {duplicate.Key.Node}, {duplicate.Key.Month}/{duplicate.Key.Year}");

            header.NetworkEngineerKpi = dto.NetworkEngineerKpi;
            header.Division = dto.Division;
            header.Section = dto.Section;
            header.KpiPercent = dto.KpiPercent;

            // remove old nodes and insert new set
            _context.BbAnwKpiNodes.RemoveRange(header.Nodes);

            var nodes = (dto.Nodes ?? new()).Select(n => new BbAnwKpiNode
            {
                BbAnwKpiId = header.Id,
                NodeCode = (n.NodeCode ?? "").Trim(),
                UnavailableMinutes = n.UnavailableMinutes,
                TotalMinutes = n.TotalMinutes,
                TotalNodes = n.TotalNodes,
                Month = n.Month,
                Year = n.Year
            }).ToList();

            _context.BbAnwKpiNodes.AddRange(nodes);

            await _context.SaveChangesAsync();
            return Ok(new { header.Id });
        }

        // DELETE: /api/bb-anw/delete/{id}
        [HttpDelete("delete/{id:int}")]
        [Authorize(Policy = "AdminOnly")]
        public async Task<IActionResult> Delete(int id)
        {
            var header = await _context.BbAnwKpis
                .Include(x => x.Nodes)
                .FirstOrDefaultAsync(x => x.Id == id);

            if (header == null) return NotFound();

            _context.BbAnwKpiNodes.RemoveRange(header.Nodes);
            _context.BbAnwKpis.Remove(header);

            await _context.SaveChangesAsync();
            return Ok();
        }

        // =========================================================
        // ADMIN PAGE (HEADER ONLY CRUD)
        // =========================================================

        // GET: /api/bb-anw/headers
        [HttpGet("headers")]
        public async Task<IActionResult> GetHeaders()
        {
            var authResult = await _authorizationService.AuthorizeAsync(User, PageId, "ViewPagePolicy");
            if (!authResult.Succeeded) return Forbid();

            var headers = await _context.BbAnwKpis
                .AsNoTracking()
                .OrderBy(x => x.Id)
                .Select(x => new BbAnwHeaderDto
                {
                    Id = x.Id,
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
        [Authorize(Policy = "AdminOnly")]
        public async Task<IActionResult> AddHeader([FromBody] BbAnwHeaderDto dto)
        {
            if (dto == null) return BadRequest("Body is empty.");

            var header = new BbAnwKpi
            {
                NetworkEngineerKpi = dto.NetworkEngineerKpi,
                Division = dto.Division,
                Section = dto.Section,
                KpiPercent = dto.KpiPercent
            };

            _context.BbAnwKpis.Add(header);
            await _context.SaveChangesAsync();

            return Ok(new { header.Id });
        }

        // PUT: /api/bb-anw/update-header/{id}
        [HttpPut("update-header/{id:int}")]
        [Authorize(Policy = "AdminOnly")]
        public async Task<IActionResult> UpdateHeader(int id, [FromBody] BbAnwHeaderDto dto)
        {
            if (dto == null) return BadRequest("Body is empty.");

            var header = await _context.BbAnwKpis.FirstOrDefaultAsync(x => x.Id == id);
            if (header == null) return NotFound();

            header.NetworkEngineerKpi = dto.NetworkEngineerKpi;
            header.Division = dto.Division;
            header.Section = dto.Section;
            header.KpiPercent = dto.KpiPercent;

            await _context.SaveChangesAsync();
            return Ok(new { header.Id });
        }
    }
}
