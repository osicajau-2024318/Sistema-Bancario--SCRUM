using System.Reflection;
using Microsoft.AspNetCore.Authorization;
using Microsoft.OpenApi.Models;
using Swashbuckle.AspNetCore.SwaggerGen;

namespace AuthServiceBanco.Api.Swagger;

/// <summary>
/// Marca en Swagger solo los endpoints que requieren JWT (atributo Authorize en acción o controlador).
/// </summary>
public sealed class SwaggerAuthorizeOperationFilter : IOperationFilter
{
    public void Apply(OpenApiOperation operation, OperationFilterContext context)
    {
        if (!EndpointRequiresAuth(context))
            return;

        operation.Security ??= new List<OpenApiSecurityRequirement>();
        operation.Security.Add(new OpenApiSecurityRequirement
        {
            [new OpenApiSecurityScheme
            {
                Reference = new OpenApiReference
                {
                    Type = ReferenceType.SecurityScheme,
                    Id = "Bearer"
                }
            }] = Array.Empty<string>()
        });
    }

    private static bool EndpointRequiresAuth(OperationFilterContext context)
    {
        var method = context.MethodInfo;
        if (method.GetCustomAttribute<AllowAnonymousAttribute>(inherit: true) != null)
            return false;

        if (method.GetCustomAttribute<AuthorizeAttribute>(inherit: true) != null)
            return true;

        return method.DeclaringType?.GetCustomAttribute<AuthorizeAttribute>(inherit: true) != null;
    }
}
