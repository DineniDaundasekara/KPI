using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using backend.Data;
using backend.Models;
using backend.DTOs;
using Microsoft.AspNetCore.Authorization;

namespace backend.Controllers
{
    [ApiController]
    [Route("api/kpis")]
    [Authorize]
    public class KpiController : ControllerBase
    {
        private readonly AppDbContext _context;

        public KpiController(AppDbContext context)
        {
            _context = context;
        }

        // endpoints here
    }
}
