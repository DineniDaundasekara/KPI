// Controllers/TmActivityPlansController.cs
using System;
using System.Collections.Generic;
using System.Threading.Tasks;
using AutoMapper;
using Microsoft.AspNetCore.Mvc;
using Microsoft.Extensions.Logging;
using backend.DTOs;
using backend.Models;
using backend.Repositories;

namespace backend.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class TmActivityPlansController : ControllerBase
    {
        private readonly ITmActivityPlanRepository _repository;
        private readonly IMapper _mapper;
        private readonly ILogger<TmActivityPlansController> _logger;

        public TmActivityPlansController(
            ITmActivityPlanRepository repository,
            IMapper mapper,
            ILogger<TmActivityPlansController> logger)
        {
            _repository = repository;
            _mapper = mapper;
            _logger = logger;
        }

        // GET: api/TmActivityPlans
        [HttpGet]
        public async Task<ActionResult<IEnumerable<TmActivityPlanDto>>> GetTmActivityPlans()
        {
            try
            {
                var plans = await _repository.GetAllAsync();
                var planDtos = _mapper.Map<IEnumerable<TmActivityPlanDto>>(plans);
                return Ok(planDtos);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error getting TM activity plans");
                return StatusCode(500, "Internal server error");
            }
        }

        // GET: api/TmActivityPlans/5
        [HttpGet("{id}")]
        public async Task<ActionResult<TmActivityPlanDto>> GetTmActivityPlan(int id)
        {
            try
            {
                var plan = await _repository.GetByIdAsync(id);

                if (plan == null)
                {
                    return NotFound();
                }

                return _mapper.Map<TmActivityPlanDto>(plan);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, $"Error getting TM activity plan with id {id}");
                return StatusCode(500, "Internal server error");
            }
        }

        // POST: api/TmActivityPlans
        [HttpPost]
        public async Task<ActionResult<TmActivityPlanDto>> CreateTmActivityPlan(CreateTmActivityPlanDto createDto)
        {
            try
            {
                if (!ModelState.IsValid)
                {
                    return BadRequest(ModelState);
                }

                var plan = _mapper.Map<TmActivityPlan>(createDto);
                plan.CreatedDate = DateTime.UtcNow;

                var createdPlan = await _repository.CreateAsync(plan);
                var planDto = _mapper.Map<TmActivityPlanDto>(createdPlan);

                return CreatedAtAction(nameof(GetTmActivityPlan), 
                    new { id = planDto.Id }, planDto);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error creating TM activity plan");
                return StatusCode(500, "Internal server error");
            }
        }

        // PUT: api/TmActivityPlans/5
        [HttpPut("{id}")]
        public async Task<IActionResult> UpdateTmActivityPlan(int id, UpdateTmActivityPlanDto updateDto)
        {
            try
            {
                if (!ModelState.IsValid)
                {
                    return BadRequest(ModelState);
                }

                if (!await _repository.ExistsAsync(id))
                {
                    return NotFound();
                }

                var plan = await _repository.GetByIdAsync(id);
                _mapper.Map(updateDto, plan);
                plan.ModifiedDate = DateTime.UtcNow;

                await _repository.UpdateAsync(plan);

                return NoContent();
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, $"Error updating TM activity plan with id {id}");
                return StatusCode(500, "Internal server error");
            }
        }

        // DELETE: api/TmActivityPlans/5
        [HttpDelete("{id}")]
        public async Task<IActionResult> DeleteTmActivityPlan(int id)
        {
            try
            {
                var result = await _repository.DeleteAsync(id);
                if (!result)
                {
                    return NotFound();
                }

                return NoContent();
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, $"Error deleting TM activity plan with id {id}");
                return StatusCode(500, "Internal server error");
            }
        }
    }
}