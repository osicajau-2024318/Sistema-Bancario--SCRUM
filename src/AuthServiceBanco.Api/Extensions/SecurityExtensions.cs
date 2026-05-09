using Microsoft.AspNetCore.DataProtection;

namespace AuthServiceBanco.Api.Extensions;

public static class SecurityExtensions
{
    private static readonly string[] DefaultAllowedOrigins =
    [
        "http://localhost:3000",
        "https://localhost:3001",
        // Puertos típicos de Vite en desarrollo (frontend React)
        "http://localhost:5173",
        "http://localhost:5174",
        "http://localhost:5175",
        "http://127.0.0.1:5173",
        "http://127.0.0.1:5174",
        "http://127.0.0.1:5175"
    ];
    private static readonly string[] DefaultAdminOrigins = ["https://admin.localhost"];
    private static readonly string[] AllowedHttpMethods = ["GET", "POST", "PUT", "DELETE", "OPTIONS"];
    private static readonly string[] AdminHttpMethods = ["GET", "POST", "PUT", "DELETE"];
    private static readonly string[] AdminAllowedHeaders = ["Content-Type", "Authorization"];
    public static IServiceCollection AddSecurityPolicies(this IServiceCollection services, IConfiguration configuration)
    {
        // Detectar entorno desde variables de entorno (Development por defecto)
        var aspNetEnv = Environment.GetEnvironmentVariable("ASPNETCORE_ENVIRONMENT")
                        ?? Environment.GetEnvironmentVariable("DOTNET_ENVIRONMENT")
                        ?? "Development";
        var isDevelopment = string.Equals(aspNetEnv, "Development", StringComparison.OrdinalIgnoreCase);

        // Configurar CORS
        services.AddCors(options =>
        {
            options.AddPolicy("DefaultCorsPolicy", builder =>
            {
                if (isDevelopment)
                {
                    // En desarrollo: permitir cualquier origen localhost / 127.0.0.1 (cualquier puerto)
                    // Nota: con AllowCredentials no se puede usar AllowAnyOrigin, por eso usamos SetIsOriginAllowed
                    builder.SetIsOriginAllowed(origin =>
                        {
                            if (string.IsNullOrWhiteSpace(origin)) return false;
                            if (!Uri.TryCreate(origin, UriKind.Absolute, out var uri)) return false;
                            return uri.Host == "localhost" || uri.Host == "127.0.0.1";
                        })
                        .AllowAnyHeader()
                        .AllowAnyMethod()
                        .AllowCredentials()
                        .SetPreflightMaxAge(TimeSpan.FromMinutes(10));
                }
                else
                {
                    // En producción: lista explícita desde configuración
                    var allowedOrigins = configuration.GetSection("Security:AllowedOrigins").Get<string[]>()
                        ?? DefaultAllowedOrigins;

                    builder.WithOrigins(allowedOrigins)
                           .AllowAnyHeader()
                           .WithMethods(AllowedHttpMethods)
                           .AllowCredentials()
                           .SetPreflightMaxAge(TimeSpan.FromMinutes(10));
                }
            });

            // Política restrictiva para endpoints administrativos
            options.AddPolicy("AdminCorsPolicy", builder =>
            {
                var adminOrigins = configuration.GetSection("Security:AdminAllowedOrigins").Get<string[]>()
                    ?? DefaultAdminOrigins;

                builder.WithOrigins(adminOrigins)
                       .WithHeaders(AdminAllowedHeaders)
                       .WithMethods(AdminHttpMethods)
                       .AllowCredentials();
            });
        });

        // Configurar Data Protection
        var keysDirectory = new DirectoryInfo("./keys");
        if (!keysDirectory.Exists)
        {
            keysDirectory.Create();
        }

        var dataProtectionBuilder = services.AddDataProtection()
                .PersistKeysToFileSystem(keysDirectory)
                .SetApplicationName("AuthDotnetApi")
                .SetDefaultKeyLifetime(TimeSpan.FromDays(90));

        // En producción, configurar encriptación con certificado
        var environment = services.BuildServiceProvider().GetRequiredService<IWebHostEnvironment>();
        if (environment.IsProduction())
        {
            // En producción deberías usar un certificado real
            // dataProtectionBuilder.ProtectKeysWithCertificate("thumbprint");
            if (OperatingSystem.IsWindows())
            {
                dataProtectionBuilder.ProtectKeysWithDpapi();
            }
            // En Linux/macOS en producción, usar certificados o Azure Key Vault
        }
        else
        {
            // En desarrollo, usar DPAPI (solo Windows) o sin encriptación
            if (OperatingSystem.IsWindows())
            {
                dataProtectionBuilder.ProtectKeysWithDpapi();
            }
            // En Linux/macOS en desarrollo, las claves no se encriptan (solo para desarrollo)
        }

        // Configurar Antiforgery (CSRF Protection)
        services.AddAntiforgery(options =>
        {
            options.HeaderName = "X-CSRF-TOKEN";
            options.SuppressXFrameOptionsHeader = false;
            options.Cookie.Name = "__RequestVerificationToken";
            options.Cookie.HttpOnly = true;
            options.Cookie.SecurePolicy = CookieSecurePolicy.SameAsRequest;
            options.Cookie.SameSite = SameSiteMode.Strict;
        });

        return services;
    }

    public static IServiceCollection AddSecurityOptions(this IServiceCollection services)
    {
        services.Configure<CookiePolicyOptions>(options =>
        {
            options.CheckConsentNeeded = context => true;
            options.MinimumSameSitePolicy = SameSiteMode.Strict;
            options.HttpOnly = Microsoft.AspNetCore.CookiePolicy.HttpOnlyPolicy.Always;
            options.Secure = CookieSecurePolicy.SameAsRequest;
        });

        return services;
    }
}

