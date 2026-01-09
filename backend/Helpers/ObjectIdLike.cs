using System.Security.Cryptography;

namespace backend.Helpers
{
    public static class ObjectIdLike
    {
        // Simple 24-hex string generator (not Mongo official, but same format length)
        public static string NewId24()
        {
            byte[] bytes = RandomNumberGenerator.GetBytes(12); // 12 bytes => 24 hex chars
            return Convert.ToHexString(bytes).ToLowerInvariant();
        }
    }
}
