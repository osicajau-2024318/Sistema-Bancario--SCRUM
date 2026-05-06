// Importa el contexto de base de datos de Entity Framework
using AuthServiceBanco.Persistence.Data;
// Importa los seeders para inicializar datos en la base de datos
using AuthServiceBanco.Persistence.Seed;
// Importa los middlewares personalizados de la API
using AuthServiceBanco.Api.Middlewares;
// Importa extensiones para configurar servicios
using AuthServiceBanco.Api.Extensions;
// Importa model binders personalizados
using AuthServiceBanco.Api.ModelBinders;
// Importa validadores de FluentValidation
using AuthServiceBanco.Application.Validators;
// Importa Serilog para logging estructurado
using Serilog;
// Importa interfaces para obtener información del servidor
using Microsoft.AspNetCore.Hosting.Server;
using Microsoft.AspNetCore.Hosting.Server.Features;
// Importa clases para manejo de JWT
using System.IdentityModel.Tokens.Jwt;
// Importa FluentValidation para validación de DTOs
using FluentValidation;
using FluentValidation.AspNetCore;

// Desactivar mapeo automático de claims JWT para preservar "sub" y otros claims estándar
// Esto evita que .NET convierta "sub" a "http://schemas.xmlsoap.org/ws/2005/05/identity/claims/nameidentifier"
JwtSecurityTokenHandler.DefaultInboundClaimTypeMap.Clear();

// Crea el builder de la aplicación web
// Crea el builder de la aplicación web
var builder = WebApplication.CreateBuilder(args);

// Configura Serilog como el logger de la aplicación
// Lee la configuración desde appsettings.json y servicios del DI container
builder.Host.UseSerilog((context, services, loggerConfiguration) =>
    loggerConfiguration
        .ReadFrom.Configuration(context.Configuration)
        .ReadFrom.Services(services));

// Configura los controladores de la API
builder.Services.AddControllers(options =>
{
    // Agrega un model binder personalizado para manejar archivos
    options.ModelBinderProviders.Insert(0, new FileDataModelBinderProvider());
})
.AddJsonOptions(o =>
{
    // Configura la serialización JSON para usar camelCase en las propiedades
    o.JsonSerializerOptions.PropertyNamingPolicy = System.Text.Json.JsonNamingPolicy.CamelCase;
});

// Agrega validación automática con FluentValidation
builder.Services.AddFluentValidationAutoValidation();
// Registra todos los validadores del assembly que contiene CreateClientDtoValidator
builder.Services.AddValidatorsFromAssemblyContaining<CreateClientDtoValidator>();
// Registra servicios de la capa de aplicación (repositorios, servicios, etc)
builder.Services.AddApplicationServices(builder.Configuration);
// Configura Swagger para documentación de la API
builder.Services.AddApiDocumentation();
// Configura autenticación con JWT
builder.Services.AddJwtAuthentication(builder.Configuration);
// Configura políticas de rate limiting (límite de peticiones)
builder.Services.AddRateLimitingPolicies();

// Configura CORS para permitir peticiones desde el frontend
builder.Services.AddCors(options =>
{
    options.AddPolicy("DefaultCorsPolicy", policy =>
    {
        policy.WithOrigins(
            "http://localhost:5173",    // Puerto por defecto Vite
            "http://localhost:5174",    // Puerto alternativo Vite
            "http://localhost:3000",    // Otros puertos comunes
            "http://localhost:3001",
            "http://127.0.0.1:5173",
            "http://127.0.0.1:5174"
        )
        .AllowAnyMethod()               // Permite GET, POST, PUT, DELETE, PATCH, etc.
        .AllowAnyHeader()               // Permite cualquier header
        .AllowCredentials();            // Permite enviar cookies y credenciales
    });
});

// Construye la aplicación
var app = builder.Build();

// En desarrollo, habilita Swagger UI para probar la API
if (app.Environment.IsDevelopment())
{
    app.UseSwagger();
    app.UseSwaggerUI();
}

// Middleware para logging de peticiones HTTP con Serilog
// Middleware para logging de peticiones HTTP con Serilog
app.UseSerilogRequestLogging();

// Configura headers de seguridad HTTP para proteger la aplicación
app.UseSecurityHeaders(policies => policies
    .AddDefaultSecurityHeaders()                        // Agrega headers de seguridad por defecto
    .RemoveServerHeader()                               // Remueve header que expone tecnología del servidor
    .AddFrameOptionsDeny()                              // Previene clickjacking (no permite iframes)
    .AddXssProtectionBlock()                            // Protección contra XSS
    .AddContentTypeOptionsNoSniff()                     // Previene MIME type sniffing
    .AddReferrerPolicyStrictOriginWhenCrossOrigin()    // Política de referrer segura
    .AddContentSecurityPolicy(builder =>                // Política de seguridad de contenido
    {
        builder.AddDefaultSrc().Self();                 // Solo permite recursos del mismo origen
        builder.AddScriptSrc().Self().UnsafeInline();  // Scripts del mismo origen + inline
        builder.AddStyleSrc().Self().UnsafeInline();   // Estilos del mismo origen + inline
        builder.AddImgSrc().Self().Data();             // Imágenes del mismo origen + data URIs
        builder.AddFontSrc().Self().Data();            // Fuentes del mismo origen + data URIs
        builder.AddConnectSrc().Self();                // Conexiones solo al mismo origen
        builder.AddFrameAncestors().None();            // No permite ser embebido en iframes
        builder.AddBaseUri().Self();                   // Tag <base> solo puede apuntar al mismo origen
        builder.AddFormAction().Self();                // Forms solo pueden enviar al mismo origen
    })
    .AddCustomHeader("Permissions-Policy", "geolocation=(), microphone=(), camera=()")  // Deshabilita APIs sensibles
    .AddCustomHeader("Cache-Control", "no-store, no-cache, must-revalidate, private")  // Evita cacheo de respuestas
);

// Middleware global para capturar y manejar excepciones
app.UseMiddleware<GlobalExceptionMiddleware>();

// Pipeline de middlewares de ASP.NET Core
app.UseHttpsRedirection();           // Redirige HTTP a HTTPS
app.UseCors("DefaultCorsPolicy");    // Aplica política CORS
app.UseRateLimiter();                // Aplica limitación de peticiones
app.UseAuthentication();             // Valida autenticación JWT
app.UseAuthorization();              // Valida autorización y roles

// Mapea los controladores como endpoints
app.MapControllers();

// Endpoint de health check para verificar que la API está funcionando
app.MapGet("/health", () =>
{
    var response = new
    {
        status = "Healthy",
        timestamps = DateTime.UtcNow.ToString("yyyy-MM-ddTHH:mm:ss.fffZ")
    };
    return Results.Ok(response);
});

// Logger para mensajes de inicio
var startupLogger = app.Services.GetRequiredService<ILogger<Program>>();
// Registra evento cuando la aplicación ha iniciado completamente
app.Lifetime.ApplicationStarted.Register(() =>
{
    try
    {
        // Obtiene las direcciones en las que está escuchando el servidor
        var server = app.Services.GetRequiredService<IServer>();
        var addressesFeature = server.Features.Get<IServerAddressesFeature>();
        var addresses = (IEnumerable<string>?)addressesFeature?.Addresses ?? app.Urls;

        // Muestra las URLs en las que la API está escuchando
        if (addresses != null && addresses.Any())
        {
            foreach (var addr in addresses)
            {
                var health = $"{addr.TrimEnd('/')}/health";
                startupLogger.LogInformation("AuthService API is running at {Url}. Health endpoint: {HealthUrl}", addr, health);
            }
        }
        else
        {
            startupLogger.LogInformation("AuthService API started. Health endpoint: /health");
        }
    }
    catch (Exception ex)
    {
        startupLogger.LogWarning(ex, "Failed to determine the listening addresses for startup log");
    }
});

// Inicializa la base de datos y ejecuta los seeders
using (var scope = app.Services.CreateScope())
{
    // Obtiene el contexto de base de datos del DI container
    var context = scope.ServiceProvider.GetRequiredService<ApplicationDbContext>();
    var logger = scope.ServiceProvider.GetRequiredService<ILogger<Program>>();

    try
    {
        logger.LogInformation("Checking database connection...");
        // Asegura que la base de datos existe (crea si no existe)
        await context.Database.EnsureCreatedAsync();
        logger.LogInformation("Database ready. Running seed data...");
        // Ejecuta el seeder de datos iniciales
        await DataSeeder.SeedAsync(context);
        // Ejecuta el seeder del usuario administrador
        await AdminSeed.InitializeAsync(scope.ServiceProvider);
        logger.LogInformation("Database initialization completed successfully");
    }
    catch (Exception ex)
    {
        logger.LogError(ex, "An error occurred while initializing the database");
        throw;
    }
}

// Inicia la aplicación
app.Run();