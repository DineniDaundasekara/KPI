using backend.Models;

namespace backend.Helpers.Calculations
{
    public static class OtnOp1Calc
    {
        public static (decimal Achieved, decimal Points) Calculate(List<OtnOp1Metrics> metrics, decimal target, int maxPoints)
        {
            if (metrics == null || !metrics.Any()) return (0, 0);

            long totalUnavailable = metrics.Sum(m => (long)m.UnavailableMinutes);
            long totalMinutes = metrics.Sum(m => (long)m.TotalMinutes);

            if (totalMinutes == 0) return (1.0m, maxPoints); // 100% available if no time logged? Or 0? User said "If TotalMinutes == 0 then Achieved = 1.0"

            decimal unavailableRatio = (decimal)totalUnavailable / totalMinutes;
            decimal achieved = 1.0m - unavailableRatio;

            decimal points = KpiPoints.CalculatePoints(achieved, target, maxPoints);

            return (achieved, points);
        }
    }
}
