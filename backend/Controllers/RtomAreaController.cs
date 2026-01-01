
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using backend.Data;
using backend.Models;
namespace backend.Controllers
{
    [Route("api/rtom-areas")]
    [ApiController]
    public class RtomAreaController : ControllerBase
    {
        private readonly AppDbContext _context;

        public RtomAreaController(AppDbContext context)
        {
            _context = context;
        }

        [HttpGet]
        public async Task<IActionResult> GetAll()
        {
            return Ok(await _context.RtomArea.ToListAsync());
        }
    }
}
