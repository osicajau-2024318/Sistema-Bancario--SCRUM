using Microsoft.AspNetCore.Authentication.JwtBearer;
using Microsoft.IdentityModel.Tokens;
using System.Text;
using System.Text.Json;

namespace AuthServiceBanco.Api.Extensions;

public static class AuthenticationExtensions
{
    public static IServiceCollection AddJwtAuthentication(this IServiceCollection services, IConfiguration configuration)
    {
        var jwtSettings = configuration.GetSection("JwtSettings");
        var secretKey = jwtSettings["SecretKey"] ?? throw new InvalidOperationException("JWT SecretKey not configured");

        services.AddAuthentication(options =>
        {
            options.DefaultAuthenticateScheme = JwtBearerDefaults.AuthenticationScheme;
            options.DefaultChallengeScheme = JwtBearerDefaults.AuthenticationScheme;
        })
        .AddJwtBearer(options =>
        {
            options.TokenValidationParameters = new TokenValidationParameters
            {
                ValidateIssuer = true,
                ValidateAudience = true,
                ValidateLifetime = true,
                ValidateIssuerSigningKey = true,
                ValidIssuer = jwtSettings["Issuer"],
                ValidAudience = jwtSettings["Audience"],
                IssuerSigningKey = new SymmetricSecurityKey(Encoding.UTF8.GetBytes(secretKey)),
                RoleClaimType = "role",
                ClockSkew = TimeSpan.Zero
            };

            // Eventos para devolver mensajes claros en lugar de 401/403 vacíos
            options.Events = new JwtBearerEvents
            {
                OnChallenge = async context =>
                {
                    context.HandleResponse();

                    string message;

                    if (context.AuthenticateFailure is SecurityTokenExpiredException)
                    {
                        message = "El token ha expirado. Por favor inicia sesión nuevamente.";
                    }
                    else if (context.AuthenticateFailure is SecurityTokenInvalidSignatureException)
                    {
                        message = "Token inválido. La firma no es correcta.";
                    }
                    else if (context.AuthenticateFailure != null)
                    {
                        message = "Token inválido o malformado.";
                    }
                    else
                    {
                        message = "No se proporcionó token de autenticación.";
                    }

                    context.Response.StatusCode = 401;
                    context.Response.ContentType = "application/json";

                    var response = JsonSerializer.Serialize(new
                    {
                        success = false,
                        message,
                        errorCode = "UNAUTHORIZED"
                    });

                    await context.Response.WriteAsync(response);
                },

                OnForbidden = async context =>
                {
                    context.Response.StatusCode = 403;
                    context.Response.ContentType = "application/json";

                    var response = JsonSerializer.Serialize(new
                    {
                        success = false,
                        message = "No tienes permisos para realizar esta acción.",
                        errorCode = "FORBIDDEN"
                    });

                    await context.Response.WriteAsync(response);
                }
            };
        });

        return services;
    }
}