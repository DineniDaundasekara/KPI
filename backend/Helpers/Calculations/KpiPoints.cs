namespace backend.Helpers.Calculations
{
    public static class KpiPoints
    {
        public static decimal CalculatePoints(decimal achieved, decimal target, int maxPoints)
        {
            if (target == 0) return 0; // Avoid division by zero

            // Logic: if Achieved >= Target then MaxPoints else MaxPoints * (Achieved / Target)
            if (achieved >= target)
            {
                return maxPoints;
            }
            else
            {
                // Calculate proportional points
                decimal ratio = achieved / target;
                return maxPoints * ratio;
            }
        }
    }
}
