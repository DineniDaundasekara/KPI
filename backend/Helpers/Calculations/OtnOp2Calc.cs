using backend.Models;

namespace backend.Helpers.Calculations
{
    public static class OtnOp2Calc
    {
        public static (decimal Achieved, decimal Points) Calculate(List<OtnOp2Metrics> metrics, decimal target, int maxPoints)
        {
            if (metrics == null || !metrics.Any()) return (0, 0);

            long totalFailed = metrics.Sum(m => (long)m.TotalFailedLinks);
            long notViolated = metrics.Sum(m => (long)m.LinksSlaNotViolated);

            if (totalFailed == 0) return (1.0m, maxPoints); // User said "If TotalFailedLinks == 0 then Achieved = 1.0"

            decimal achieved = (decimal)notViolated / totalFailed;
            decimal points = KpiPoints.CalculatePoints(achieved, target, maxPoints);

            return (achieved, points);
        }
    }
}
