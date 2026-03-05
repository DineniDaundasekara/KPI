using Microsoft.AspNetCore.Mvc;
using backend.Services;
using System.Collections.Generic;
using System.Threading.Tasks;

namespace backend.Controllers
{
    [ApiController]
    [Route("api/multi-table")]
    public class MultiTableController : ControllerBase
    {
        private readonly IMultiTableService _multiTableService;

        public MultiTableController(IMultiTableService multiTableService)
        {
            _multiTableService = multiTableService;
        }

        /// <summary>
        /// Fetch MSAN platform data
        /// </summary>
        [HttpGet("fetchMsan")]
        public async Task<IActionResult> FetchMsan()
        {
            try
            {
                var data = await _multiTableService.FetchMsanDataAsync();
                return Ok(data);
            }
            catch (Exception ex)
            {
                return BadRequest(new { error = ex.Message });
            }
        }

        /// <summary>
        /// Fetch VPN platform data
        /// </summary>
        [HttpGet("fetchVpn")]
        public async Task<IActionResult> FetchVpn()
        {
            try
            {
                var data = await _multiTableService.FetchVpnDataAsync();
                return Ok(data);
            }
            catch (Exception ex)
            {
                return BadRequest(new { error = ex.Message });
            }
        }

        /// <summary>
        /// Fetch SLBN platform data
        /// </summary>
        [HttpGet("fetchSlbn")]
        public async Task<IActionResult> FetchSlbn()
        {
            try
            {
                var data = await _multiTableService.FetchSlbnDataAsync();
                return Ok(data);
            }
            catch (Exception ex)
            {
                return BadRequest(new { error = ex.Message });
            }
        }
    }
}
