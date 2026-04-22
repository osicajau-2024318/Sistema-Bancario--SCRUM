using System.Reflection;
using AuthServiceBanco.Api.Swagger;
using AuthServiceBanco.Application.Interfaces;
using AuthServiceBanco.Application.Services;
using AuthServiceBanco.Application.Validators;
using AuthServiceBanco.Domain.Entities;
using AuthServiceBanco.Domain.Interfaces;
using AuthServiceBanco.Persistence.Data;
using AuthServiceBanco.Persistence.Repositories;
using FluentValidation;
using FluentValidation.AspNetCore;
using Microsoft.AspNetCore.Identity;
using Microsoft.EntityFrameworkCore;
using Microsoft.OpenApi.Models;

namespace AuthServiceBanco.Api.Extensions;

public static class ServiceCollectionExtensions
{
    public static IServiceCollection AddApplicationServices(this IServiceCollection services, IConfiguration configuration)
    {
        services.AddDbContext<ApplicationDbContext>(options =>
            options.UseNpgsql(configuration.GetConnectionString("DefaultConnection"))
                .UseSnakeCaseNamingConvention());
        
        services.AddScoped<IUserRepository, UserRepository>();
        services.AddScoped<IRoleRepository, RoleRepository>();
        services.AddScoped<IAuthService, AuthService>();
        services.AddScoped<IUserManagementService, UserManagementService>();
        services.AddScoped<IAdminService, AdminService>();
        services.AddScoped<IPasswordHashService, PasswordHashService>();
        services.AddScoped<IJwtTokenService, JwtTokenService>();
        services.AddScoped<ICloudinaryService, CloudinaryService>();
        services.AddScoped<IEmailService, EmailService>();
        services.AddScoped<IPasswordHasher<User>, PasswordHasher<User>>();

        // Add FluentValidation
        services.AddFluentValidationAutoValidation();
        services.AddValidatorsFromAssemblyContaining<CreateClientDtoValidator>();

        services.AddHealthChecks();

        return services;
    }

    public static IServiceCollection AddApiDocumentation(this IServiceCollection services)
    {
        services.AddEndpointsApiExplorer();
        services.AddSwaggerGen(options =>
        {
            options.SwaggerDoc("v1", new OpenApiInfo
            {
                Version = "v1",
                Title = "AuthService Banco API",
                Description = """
                    Servicio de autenticación y gestión de usuarios (PostgreSQL + JWT).

                    **Módulo cubierto en documentación extendida:** administración de usuarios (creación de clientes, listado, edición, eliminación, activación) y **usuarios y roles** (consulta de roles, cambio de rol, usuarios por rol).

                    Obtenga un token con `POST /api/v1/auth/login` y use el botón **Authorize** para enviar `Bearer {token}`.
                    """
            });

            var xmlFile = $"{Assembly.GetExecutingAssembly().GetName().Name}.xml";
            var xmlPath = Path.Combine(AppContext.BaseDirectory, xmlFile);
            if (File.Exists(xmlPath))
                options.IncludeXmlComments(xmlPath, includeControllerXmlComments: true);

            options.AddSecurityDefinition("Bearer", new OpenApiSecurityScheme
            {
                Name = "Authorization",
                Type = SecuritySchemeType.Http,
                Scheme = "bearer",
                BearerFormat = "JWT",
                In = ParameterLocation.Header,
                Description = "JWT emitido por POST /api/v1/auth/login. Ejemplo: Bearer eyJhbGciOi..."
            });

            options.OperationFilter<SwaggerAuthorizeOperationFilter>();
        });

        return services;
    }
}