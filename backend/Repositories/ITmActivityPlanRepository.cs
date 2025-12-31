using System.Collections.Generic;
using System.Threading.Tasks;
using backend.Models;

namespace backend.Repositories
{
    public interface ITmActivityPlanRepository
    {
        Task<IEnumerable<TmActivityPlan>> GetAllAsync();
        Task<TmActivityPlan> GetByIdAsync(int id);
        Task<TmActivityPlan> CreateAsync(TmActivityPlan plan);
        Task UpdateAsync(TmActivityPlan plan);
        Task<bool> DeleteAsync(int id);
        Task<bool> ExistsAsync(int id);
    }
}
