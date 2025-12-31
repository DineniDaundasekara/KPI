using System.Collections.Generic;
using System.Threading.Tasks;
using Microsoft.EntityFrameworkCore;
using backend.Data;
using backend.Models;

namespace backend.Repositories
{
    public class TmActivityPlanRepository : ITmActivityPlanRepository
    {
        private readonly AppDbContext _context;

        public TmActivityPlanRepository(AppDbContext context)
        {
            _context = context;
        }

        public async Task<IEnumerable<TmActivityPlan>> GetAllAsync()
        {
            return await _context.TmActivityPlans.ToListAsync();
        }

        public async Task<TmActivityPlan> GetByIdAsync(int id)
        {
            return await _context.TmActivityPlans.FindAsync(id);
        }

        public async Task<TmActivityPlan> CreateAsync(TmActivityPlan plan)
        {
            _context.TmActivityPlans.Add(plan);
            await _context.SaveChangesAsync();
            return plan;
        }

        public async Task UpdateAsync(TmActivityPlan plan)
        {
            _context.Entry(plan).State = EntityState.Modified;
            await _context.SaveChangesAsync();
        }

        public async Task<bool> DeleteAsync(int id)
        {
            var plan = await _context.TmActivityPlans.FindAsync(id);
            if (plan == null)
            {
                return false;
            }

            _context.TmActivityPlans.Remove(plan);
            await _context.SaveChangesAsync();
            return true;
        }

        public async Task<bool> ExistsAsync(int id)
        {
            return await _context.TmActivityPlans.AnyAsync(e => e.Id == id);
        }
    }
}
