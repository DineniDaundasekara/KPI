/*
 * File: RegionController.cs
 * Provides API endpoints for managing region data records including
 * retrieval, creation, update, and deletion.
 */

using backend.Data;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using backend.Models;
using Microsoft.AspNetCore.Authorization;

namespace backend.Controllers
{
    // =========================================================
    // REGION DATA CONTROLLER
    // Handles CRUD operations for region data records
    // =========================================================
    [Route("api/regiondata")]
    [ApiController]
    [Authorize]
    public class RegionController : ControllerBase
    {
        // Database context for region data
        private readonly AppDbContext _context;

        // Inject database context
        public RegionController(AppDbContext context)
        {
            _context = context;
        }

        // =========================================================
        // GET ALL REGION DATA
        // =========================================================
        [HttpGet]
        public async Task<IActionResult> GetAll()
        {
            // Retrieve all region records
            return Ok(await _context.RegionData.ToListAsync());
        }

        // =========================================================
        // GET REGION DATA BY ID
        // =========================================================
        [HttpGet("{id}")]
        public async Task<IActionResult> GetById(int id)
        {
            // Find region record by primary key
            var data = await _context.RegionData.FindAsync(id);

            if (data == null)
                return NotFound();

            return Ok(data);
        }

        // =========================================================
        // CREATE NEW REGION RECORD
        // Admin-only endpoint
        // =========================================================
        [HttpPost]
        [Authorize(Policy = "AdminOnly")]
        public async Task<IActionResult> Create(RegionData model)
        {
            // Insert new region record
            _context.RegionData.Add(model);

            await _context.SaveChangesAsync();

            return Ok(model);
        }

        // =========================================================
        // UPDATE EXISTING REGION RECORD
        // Admin-only endpoint
        // =========================================================
        [HttpPut("{id}")]
        [Authorize(Policy = "AdminOnly")]
        public async Task<IActionResult> Update(int id, RegionData model)
        {
            // Validate route id matches model id
            if (id != model.Id)
                return BadRequest();

            // Mark entity as modified
            _context.Entry(model).State = EntityState.Modified;

            await _context.SaveChangesAsync();

            return Ok(model);
        }

        // =========================================================
        // DELETE REGION RECORD
        // Admin-only endpoint
        // =========================================================
        [HttpDelete("{id}")]
        [Authorize(Policy = "AdminOnly")]
        public async Task<IActionResult> Delete(int id)
        {
            // Find region record by id
            var data = await _context.RegionData.FindAsync(id);

            if (data == null)
                return NotFound();

            // Remove region record
            _context.RegionData.Remove(data);

            await _context.SaveChangesAsync();

            return Ok();
        }
    }
}