/*
 * File: BbAnwController.cs
 * Handles BB ANW KPI platform data including headers and node-level KPI records.
 */

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
        // Database context
        private readonly AppDbContext _context;

        // Authorization service for page-level permissions
        private readonly IAuthorizationService _authorizationService;

        // Page identifier for BB ANW platform
        private const int PageId = 3;

        public BbAnwController(AppDbContext context, IAuthorizationService authorizationService)
        {
            _context = context;
            _authorizationService = authorizationService;
        }

        // =========================================================
        // PLATFORM KPI PAGE (FULL DATA: HEADERS + NODES)
        // =========================================================

        // GET: /api/bb-anw
        // Retrieve full KPI records including node data
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

        // GET: /api/bb-anw/{id}
        // Retrieve a single KPI record
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
    }
}