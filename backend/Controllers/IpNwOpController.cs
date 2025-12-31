using backend.Models; // Add this to access the IpNwOp model
using backend.Services; // Add this to import the IpNwOpService
using Microsoft.AspNetCore.Mvc;
using System.Collections.Generic;
using System.Threading.Tasks;
using backend.Services;

namespace backend.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class IpNwOpController : ControllerBase
    {
        private readonly IpNwOpService _service;

        // Inject IpNwOpService into the controller
        public IpNwOpController(IpNwOpService service)
        {
            _service = service;
        }

        // Example: Get all IP NW OP records
        [HttpGet]
        public async Task<ActionResult<IEnumerable<IpNwOp>>> Get()
        {
            var result = await _service.GetAllAsync();
            return Ok(result);
        }

        // Example: Get a specific IP NW OP record by ID
        [HttpGet("{id}")]
        public async Task<ActionResult<IpNwOp>> Get(string id)
        {
            var row = await _service.GetByIdAsync(id);
            if (row == null)
            {
                return NotFound();
            }
            return Ok(row);
        }

        // Example: Add a new IP NW OP record
        [HttpPost]
        public async Task<ActionResult<IpNwOp>> Post([FromBody] IpNwOp row)
        {
            var addedRow = await _service.AddAsync(row);
            return CreatedAtAction(nameof(Get), new { id = addedRow.Id }, addedRow);
        }

        // Example: Update an IP NW OP record
        [HttpPut("{id}")]
        public async Task<IActionResult> Put(string id, [FromBody] IpNwOp row)
        {
            var success = await _service.UpdateAsync(id, row);
            if (!success)
            {
                return NotFound();
            }
            return NoContent();
        }

        // Example: Delete an IP NW OP record
        [HttpDelete("{id}")]
        public async Task<IActionResult> Delete(string id)
        {
            var success = await _service.DeleteAsync(id);
            if (!success)
            {
                return NotFound();
            }
            return NoContent();
        }
    }
}
