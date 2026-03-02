using AuthServiceBanco.Domain.Constants;
using AuthServiceBanco.Domain.Entities;
using AuthServiceBanco.Domain.Interfaces;
using Microsoft.Extensions.DependencyInjection;
using AuthServiceBanco.Application.Interfaces;
using AuthServiceBanco.Application.Services;

namespace AuthServiceBanco.Persistence.Seed;

public static class AdminSeed
{
    public static async Task InitializeAsync(IServiceProvider services)
    {
        var userRepo = services.GetRequiredService<IUserRepository>();
        var roleRepo = services.GetRequiredService<IRoleRepository>();
        var passwordHashService = services.GetRequiredService<IPasswordHashService>();

        var existing = await userRepo.GetByUsernameAsync("ADMINB");
        if (existing != null)
        {
            var needsUpdate = !existing.Status || existing.Password.StartsWith("AQAAAA", StringComparison.Ordinal);

            if (needsUpdate)
            {
                existing.Status = true;
                existing.Password = passwordHashService.HashPassword("ADMINB");
                existing.UpdatedAt = DateTime.UtcNow;
                await userRepo.UpdateAsync(existing);
            }

            return;
        }

        var user = new User
        {
            Id = UuidGenerator.GenerateUserId(),
            Name = "ADMIN",
            Surname = "BANK",
            Username = "ADMINB",
            Email = "admin@bank.com",
            Status = true,
            CreatedAt = DateTime.UtcNow,
            UpdatedAt = DateTime.UtcNow
        };

        user.Password = passwordHashService.HashPassword("ADMINB");

        var profile = new UserProfile
        {
            Id = UuidGenerator.GenerateShortUUID(),
            UserId = user.Id,
            Phone = "00000000",
            ProfilePicture = string.Empty,
            User = user
        };

        var email = new UserEmail
        {
            Id = UuidGenerator.GenerateShortUUID(),
            UserId = user.Id,
            EmailVerified = true,
            User = user
        };

        var role = await roleRepo.GetByNameAsync(RoleConstants.ADMIN_ROLE)
                   ?? throw new Exception("ADMIN role not found");

        var userRole = new UserRole
        {
            Id = UuidGenerator.GenerateShortUUID(),
            UserId = user.Id,
            RoleId = role.Id,
            CreatedAt = DateTime.UtcNow,
            UpdatedAt = DateTime.UtcNow,
            User = user,
            Role = role
        };

        await userRepo.CreateAsync(user, profile, email, userRole);
    }
}