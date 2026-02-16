using backend.Models;

namespace backend.Helpers.Calculations
{
    public static class ServiceFulfilmentCalc
    {
        public static (decimal Achieved, decimal Points) Calculate(List<ServiceFulfilmentKpiMetric> metrics, decimal target, int maxPoints)
        {
            if (metrics == null || !metrics.Any()) return (0, 0);

            // Average the KPI Value for the selected area/month? 
            // Usually valid for single month/area selection.
            // "Achieved = kpi_value / 100"
            
            decimal totalValue = metrics.Where(m => m.KpiValue.HasValue).Sum(m => m.KpiValue.Value);
            int count = metrics.Count(m => m.KpiValue.HasValue);

            if (count == 0) return (0, 0);

            decimal averageValue = totalValue / count;
            
            // Convert percent to decimal (User said "kpi_value / 100")
            decimal achieved = averageValue / 100m;

            decimal points = KpiPoints.CalculatePoints(achieved, target, maxPoints);

            return (achieved, points);
        }
    }
}
