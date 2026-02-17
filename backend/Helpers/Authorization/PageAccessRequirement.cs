using Microsoft.AspNetCore.Authorization;
using System.Security.Claims;

namespace backend.Helpers.Authorization
{
    public class PageAccessRequirement : IAuthorizationRequirement
    {
    }

    public class PageAccessHandler : AuthorizationHandler<PageAccessRequirement>
    {
        private readonly IHttpContextAccessor _httpContextAccessor;

        public PageAccessHandler(IHttpContextAccessor httpContextAccessor)
        {
            _httpContextAccessor = httpContextAccessor;
        }

        protected override Task HandleRequirementAsync(AuthorizationHandlerContext context, PageAccessRequirement requirement)
        {
            if (!context.User.Identity?.IsAuthenticated ?? true)
            {
                return Task.CompletedTask;
            }

            // SuperAdmin has access to everything
            if (context.User.HasClaim(c => c.Type == "role" && c.Value == "SuperAdmin"))
            {
                context.Succeed(requirement);
                return Task.CompletedTask;
            }

            // Extract PageId from Route or Query
            var httpContext = _httpContextAccessor.HttpContext;
            if (httpContext == null) return Task.CompletedTask;

            object? pageIdObj = null;
            if (httpContext.Request.RouteValues.TryGetValue("pageId", out pageIdObj) != true)
            {
                if (httpContext.Request.Query.ContainsKey("pageId"))
                {
                    pageIdObj = httpContext.Request.Query["pageId"];
                }
            }

            // Check if Resource is passed manually (e.g. AuthorizeAsync(User, pageId, policy))
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
                // Check if user has "allowedPages" claim for this pageId
                var allowedPages = context.User.FindAll("allowedPages").Select(c => c.Value).ToList();
                
                if (allowedPages.Contains(pageId.ToString()))
                {
                    context.Succeed(requirement);
                }
            }
            else
            {
                // If no pageId is specified, maybe we can't enforce page access policy?
                // Or maybe we succeed if we just want to check if they have ANY page access?
                // For now, if Policy "ViewPagePolicy" is used, we expect a pageId. 
                // But some endpoints might not have it.
                // Assuming "View endpoints" means "Endpoints viewing a specific page".
            }

            return Task.CompletedTask;
        }
    }
}
