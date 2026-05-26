using AdiwarnaBackend.Data;
using Microsoft.AspNetCore.Authorization;
using System.Security.Claims;

namespace AdiwarnaBackend.Authorization
{
    public class NotDisabledHandler(AdiwarnaDbContext context) : AuthorizationHandler<NotDisabledRequirement>
    {
        protected override async Task HandleRequirementAsync(AuthorizationHandlerContext authContext, NotDisabledRequirement requirement)
        {
            var userIdValue = authContext.User.FindFirstValue(ClaimTypes.NameIdentifier);
            if (!Guid.TryParse(userIdValue, out var userId))
                return;

            var user = await context.Users.FindAsync(userId);
            if (user is null)
                return;

            if (!user.IsDisabled)
                authContext.Succeed(requirement);
        }
    }
}
