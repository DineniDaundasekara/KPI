using backend.Models;

namespace backend.Helpers.Calculations
{
    public static class IpNwOpCalc
    {
        public static (decimal Achieved, decimal Points) Calculate(List<IpNwOpKpiMetric> metrics, decimal target, int maxPoints)
        {
            if (metrics == null || !metrics.Any()) return (0, 0);

            // User said: "Achieved = 1 - (TotalFailedLinks / TotalNodes) OR use schema"
            // Schema has UnavailableMinutes, TotalMinutes, TotalNodes.
            // Assumption: Availability = 1 - (Unavailable / Total) like OTN OP1, OR if TotalMinutes matches TotalNodes context?
            // "If your IpNwOp metric already stores availability percent, then: Achieved = availabilityPercent / 100"
            // The IpNwOpKpiMetric has `UnavailableMinutes` and `TotalMinutes`. I will use those if present.
            
            // Check if we have valid time data
            long totalUnavailable = metrics.Where(m => m.UnavailableMinutes.HasValue).Sum(m => (long)m.UnavailableMinutes.Value);
            long totalMinutes = metrics.Where(m => m.TotalMinutes.HasValue).Sum(m => (long)m.TotalMinutes.Value);

             if (totalMinutes > 0)
            {
                 decimal unavailableRatio = (decimal)totalUnavailable / totalMinutes;
                 decimal achieved = 1.0m - unavailableRatio;
                 decimal points = KpiPoints.CalculatePoints(achieved, target, maxPoints);
                 return (achieved, points);
            }
            
            // Fallback to average if no sum data (maybe pre-calculated?)
            // Or if TotalMinutes is 0, return 1.0 as per OTN logic?
            return (1.0m, maxPoints);
        }
    }
}
