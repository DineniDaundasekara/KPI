using Microsoft.AspNetCore.Authorization;
using System.Security.Claims;

namespace backend.Helpers.Authorization
{
    public class PlatformKpiEditRequirement : IAuthorizationRequirement
    {
    }

    public class PlatformKpiEditHandler : AuthorizationHandler<PlatformKpiEditRequirement>
    {
        private readonly IHttpContextAccessor _httpContextAccessor;
        private readonly IDateHelper _dateHelper;

        public PlatformKpiEditHandler(IHttpContextAccessor httpContextAccessor, IDateHelper dateHelper)
        {
            _httpContextAccessor = httpContextAccessor;
            _dateHelper = dateHelper;
        }

        protected override Task HandleRequirementAsync(AuthorizationHandlerContext context, PlatformKpiEditRequirement requirement)
        {
            var user = context.User;
            if (!user.Identity?.IsAuthenticated ?? true) return Task.CompletedTask;

            // 1. Check Role = PlatformAdmin (case-insensitive, trim spaces)
            bool IsRole(string roleName) => user
                .FindAll(c => c.Type == "role" || c.Type == ClaimTypes.Role)
                .Any(c => string.Equals(NormalizeRole(c.Value), NormalizeRole(roleName), StringComparison.OrdinalIgnoreCase));

            if (!IsRole("PlatformAdmin"))
            {
                return Task.CompletedTask;
            }

            // 2. Check Time Window (<= 15th)
            if (!_dateHelper.IsEditWindowOpen())
            {
                 return Task.CompletedTask;
            }

            // 3. Check Page Assignment (assigned KPI pages or allowed pages)
            var httpContext = _httpContextAccessor.HttpContext;
            
            object? pageIdObj = null;
            if (httpContext?.Request.RouteValues.TryGetValue("pageId", out pageIdObj) != true)
            {
                if (httpContext?.Request.Query.ContainsKey("pageId") == true)
                {
                    pageIdObj = httpContext.Request.Query["pageId"];
                }
            }

            // Check if Resource is passed manually
            if (pageIdObj == null && context.Resource is int resourceInt)
            {
                pageIdObj = resourceInt;
            }
            if (pageIdObj == null && context.Resource is string resourceString)
            {
                pageIdObj = resourceString;
            }

            if (pageIdObj != null && int.TryParse(pageIdObj.ToString(), out int pageId))
            {
                var assignedPages = user.FindAll("assignedKpiPages").Select(c => c.Value).ToList();

                // Only assigned KPI pages grant edit. allowedPages no longer grants edit.
                if (assignedPages.Contains(pageId.ToString()))
                {
                    context.Succeed(requirement);
                }
            }

            return Task.CompletedTask;
        }

        private static string NormalizeRole(string? value)
        {
            return (value ?? string.Empty)
                .Replace(" ", string.Empty)
                .Trim()
                .ToLowerInvariant();
        }
    }
}
