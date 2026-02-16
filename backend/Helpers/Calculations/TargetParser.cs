using System.Text.RegularExpressions;

namespace backend.Helpers.Calculations
{
    public static class TargetParser
    {
        public static decimal ParseTarget(string description)
        {
            if (string.IsNullOrWhiteSpace(description)) return 0;

            // 1. Remove "Above", "Below", etc. (case insensitive)
            var cleanDesc = Regex.Replace(description, @"(?i)(Above|Below|Target|Min|Max)\s*", "").Trim();

            // 2. Remove "%"
            bool isPercentage = cleanDesc.Contains("%");
            cleanDesc = cleanDesc.Replace("%", "").Trim();

            // 3. Try parse
            if (decimal.TryParse(cleanDesc, out decimal value))
            {
                // "90%" -> 0.90, "1" -> 1.0, "99.999" (if no % sign but implies percentage? User said '99.999%' -> 0.99999)
                if (isPercentage)
                {
                    return value / 100m;
                }
                return value;
            }

            return 0;
        }
    }
}
