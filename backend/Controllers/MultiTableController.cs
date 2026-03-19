/*
 * File: MultiTableController.cs
 * Exposes API endpoints to retrieve platform-specific KPI data
 * from multiple tables via the MultiTable service layer.
 */

using Microsoft.AspNetCore.Mvc;
using backend.Services;
using System.Collections.Generic;
using System.Threading.Tasks;

namespace backend.Controllers
{
    // =========================================================
    // MULTI TABLE CONTROLLER
    // Provides endpoints for fetching KPI data from different
    // platform-specific tables (MSAN, VPN, SLBN)
    // =========================================================
    [ApiController]
    [Route("api/multi-table")]
    public class MultiTableController : ControllerBase
    {
        // Service responsible for retrieving platform data
        private readonly IMultiTableService _multiTableService;

        // Inject service dependency
        public MultiTableController(IMultiTableService multiTableService)
        {
            _multiTableService = multiTableService;
        }

        // =========================================================
        // FETCH MSAN PLATFORM DATA
        // =========================================================
        [HttpGet("fetchMsan")]
        public async Task<IActionResult> FetchMsan()
        {
            try
            {
                // Retrieve MSAN data from service layer
                var data = await _multiTableService.FetchMsanDataAsync();
                return Ok(data);
            }
            catch (Exception ex)
            {
                // Return error response if retrieval fails
                return BadRequest(new { error = ex.Message });
            }
        }

        // =========================================================
        // FETCH VPN PLATFORM DATA
        // =========================================================
        [HttpGet("fetchVpn")]
        public async Task<IActionResult> FetchVpn()
        {
            try
            {
                // Retrieve VPN data from service layer
                var data = await _multiTableService.FetchVpnDataAsync();
                return Ok(data);
            }
            catch (Exception ex)
            {
                // Return error response if retrieval fails
                return BadRequest(new { error = ex.Message });
            }
        }

        // =========================================================
        // FETCH SLBN PLATFORM DATA
        // =========================================================
        [HttpGet("fetchSlbn")]
        public async Task<IActionResult> FetchSlbn()
        {
            try
            {
                // Retrieve SLBN data from service layer
                var data = await _multiTableService.FetchSlbnDataAsync();
                return Ok(data);
            }
            catch (Exception ex)
            {
                // Return error response if retrieval fails
                return BadRequest(new { error = ex.Message });
            }
        }
    }
}