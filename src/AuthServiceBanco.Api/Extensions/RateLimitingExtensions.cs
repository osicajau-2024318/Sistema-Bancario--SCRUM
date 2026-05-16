using System;
using System.Threading.RateLimiting;

namespace AuthServiceBanco.Api.Extensions;

public static class RateLimitingExtensions
{
    public static IServiceCollection AddRateLimitingPolicies(this IServiceCollection services)
    {
        // Detecta entorno: en Development se relajan los límites para no bloquear
        // por StrictMode, HMR, preflights y reintentos típicos del frontend
        var aspNetEnv = Environment.GetEnvironmentVariable("ASPNETCORE_ENVIRONMENT")
                        ?? Environment.GetEnvironmentVariable("DOTNET_ENVIRONMENT")
                        ?? "Production";
        var isDevelopment = string.Equals(aspNetEnv, "Development", StringComparison.OrdinalIgnoreCase);

        // Límites para autenticación (login, register, recovery, etc.)
        var authPermitLimit = isDevelopment ? 100 : 5;

        // Límites generales de API
        var apiTokenLimit = isDevelopment ? 1000 : 100;
        var apiTokensPerPeriod = isDevelopment ? 200 : 20;
        var apiQueueLimit = isDevelopment ? 50 : 5;

        services.AddRateLimiter(options =>
        {
            // Rate limiting para autenticación
            options.AddPolicy("AuthPolicy", context =>
                RateLimitPartition.GetFixedWindowLimiter(
                    partitionKey: context.Connection.RemoteIpAddress?.ToString() ?? "unknown",
                    factory: partition => new FixedWindowRateLimiterOptions
                    {
                        AutoReplenishment = true,
                        PermitLimit = authPermitLimit,
                        Window = TimeSpan.FromMinutes(1)
                    }));

            // Rate limiting general para API
            options.AddPolicy("ApiPolicy", context =>
                RateLimitPartition.GetTokenBucketLimiter(
                    partitionKey: context.Connection.RemoteIpAddress?.ToString() ?? "unknown",
                    factory: partition => new TokenBucketRateLimiterOptions
                    {
                        TokenLimit = apiTokenLimit,
                        QueueProcessingOrder = QueueProcessingOrder.OldestFirst,
                        QueueLimit = apiQueueLimit,
                        ReplenishmentPeriod = TimeSpan.FromMinutes(1),
                        TokensPerPeriod = apiTokensPerPeriod,
                        AutoReplenishment = true
                    }));

            // Respuesta cuando se excede el límite
            options.OnRejected = async (context, token) =>
            {
                context.HttpContext.Response.StatusCode = 429;
                await context.HttpContext.Response.WriteAsync("Too Many Requests. Please try again later.", token);
            };
        });

        return services;
    }
}
