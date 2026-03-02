using AuthServiceBanco.Application.DTOs;
using AuthServiceBanco.Application.DTOs.Admin;
using AuthServiceBanco.Application.Interfaces;
using AuthServiceBanco.Domain.Constants;
using AuthServiceBanco.Domain.Entities;
using AuthServiceBanco.Domain.Interfaces;

namespace AuthServiceBanco.Application.Services;

public class AdminService(
    IUserRepository users,
    IRoleRepository roles,
    IPasswordHashService passwordHashService,
    ICloudinaryService cloudinaryService
) : IAdminService
{
    public async Task<UserResponseDto> CreateClientAsync(CreateClientDto dto)
    {
        if (dto.MonthlyIncome < 100)
            throw new InvalidOperationException("No se puede crear la cuenta si los ingresos son menores a Q100");

        var user = new User
        {
            Id = UuidGenerator.GenerateUserId(),
            Name = dto.Name,
            Surname = dto.Surname,
            Username = dto.Username,
            Email = dto.Email,
            Password = string.Empty,
            Status = true,
            CreatedAt = DateTime.UtcNow,
            UpdatedAt = DateTime.UtcNow
        };

        user.Password = passwordHashService.HashPassword(dto.Password);

        var profile = new UserProfile
        {
            Id = UuidGenerator.GenerateShortUUID(),
            UserId = user.Id,
            Phone = dto.Phone,
            Dpi = dto.Dpi,
            Address = dto.Address,
            WorkName = dto.WorkName,
            MonthlyIncome = dto.MonthlyIncome,
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

        var role = await roles.GetByNameAsync(RoleConstants.USER_ROLE)
                   ?? throw new InvalidOperationException("Role USER not found");

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

        await users.CreateAsync(user, profile, email, userRole);

        return new UserResponseDto
        {
            Id = user.Id,
            Name = user.Name,
            Surname = user.Surname,
            Username = user.Username,
            Email = user.Email,
            ProfilePicture = cloudinaryService.GetFullImageUrl(profile.ProfilePicture),
            Phone = profile.Phone,
            Address = profile.Address,
            Dpi = profile.Dpi,
            WorkName = profile.WorkName,
            MonthlyIncome = profile.MonthlyIncome,
            Role = RoleConstants.USER_ROLE,
            Status = user.Status,
            IsEmailVerified = true,
            CreatedAt = user.CreatedAt,
            UpdatedAt = user.UpdatedAt
        };
    }

    public async Task<PagedResultDto<UserResponseDto>> GetAllUsersAsync(int page = 1, int pageSize = 10, string? searchTerm = null, string? role = null)
    {
        if (page < 1) page = 1;
        if (pageSize < 1) pageSize = 10;
        if (pageSize > 100) pageSize = 100;

        var (usersData, totalCount) = await users.GetAllPagedAsync(page, pageSize, searchTerm, role);

        var userDtos = usersData.Select(u => new UserResponseDto
        {
            Id = u.Id,
            Name = u.Name,
            Surname = u.Surname,
            Username = u.Username,
            Email = u.Email,
            ProfilePicture = cloudinaryService.GetFullImageUrl(u.UserProfile?.ProfilePicture ?? string.Empty),
            Phone = u.UserProfile?.Phone ?? string.Empty,
            Address = u.UserProfile?.Address ?? string.Empty,
            Dpi = u.UserProfile?.Dpi ?? string.Empty,
            WorkName = u.UserProfile?.WorkName ?? string.Empty,
            MonthlyIncome = u.UserProfile?.MonthlyIncome ?? 0,
            Role = u.UserRoles.FirstOrDefault()?.Role?.Name ?? RoleConstants.USER_ROLE,
            Status = u.Status,
            IsEmailVerified = u.UserEmail?.EmailVerified ?? false,
            CreatedAt = u.CreatedAt,
            UpdatedAt = u.UpdatedAt
        }).ToList();

        return new PagedResultDto<UserResponseDto>
        {
            Items = userDtos,
            TotalCount = totalCount,
            Page = page,
            PageSize = pageSize
        };
    }

    public async Task<UserResponseDto> GetUserByIdAsync(string userId)
    {
        var user = await users.GetByIdAsync(userId);

        return new UserResponseDto
        {
            Id = user.Id,
            Name = user.Name,
            Surname = user.Surname,
            Username = user.Username,
            Email = user.Email,
            ProfilePicture = cloudinaryService.GetFullImageUrl(user.UserProfile?.ProfilePicture ?? string.Empty),
            Phone = user.UserProfile?.Phone ?? string.Empty,
            Address = user.UserProfile?.Address ?? string.Empty,
            Dpi = user.UserProfile?.Dpi ?? string.Empty,
            WorkName = user.UserProfile?.WorkName ?? string.Empty,
            MonthlyIncome = user.UserProfile?.MonthlyIncome ?? 0,
            Role = user.UserRoles.FirstOrDefault()?.Role?.Name ?? RoleConstants.USER_ROLE,
            Status = user.Status,
            IsEmailVerified = user.UserEmail?.EmailVerified ?? false,
            CreatedAt = user.CreatedAt,
            UpdatedAt = user.UpdatedAt
        };
    }

    public async Task<UserResponseDto> UpdateUserAsync(string userId, UpdateUserDto dto)
    {
        var user = await users.GetByIdAsync(userId);

        // No permitir editar DPI ni contraseña (según requerimientos)
        // Actualizar datos básicos del usuario
        if (dto.Name != null)
            user.Name = dto.Name;

        if (dto.Surname != null)
            user.Surname = dto.Surname;

        user.UpdatedAt = DateTime.UtcNow;

        // Actualizar perfil
        if (user.UserProfile != null)
        {
            if (dto.Address != null)
                user.UserProfile.Address = dto.Address;

            if (dto.Phone != null)
                user.UserProfile.Phone = dto.Phone;

            if (dto.WorkName != null)
                user.UserProfile.WorkName = dto.WorkName;

            if (dto.MonthlyIncome.HasValue)
            {
                if (dto.MonthlyIncome.Value < 100)
                    throw new InvalidOperationException("Los ingresos mensuales deben ser al menos Q100");

                user.UserProfile.MonthlyIncome = dto.MonthlyIncome.Value;
            }
        }

        await users.UpdateAsync(user);

        return await GetUserByIdAsync(userId);
    }

    public async Task<bool> DeleteUserAsync(string userId)
    {
        var user = await users.GetByIdAsync(userId);

        // No permitir eliminar administradores
        var isAdmin = user.UserRoles.Any(ur => ur.Role.Name == RoleConstants.ADMIN_ROLE);
        if (isAdmin)
        {
            throw new InvalidOperationException("No se puede eliminar un usuario administrador");
        }

        return await users.DeleteAsync(userId);
    }
}
