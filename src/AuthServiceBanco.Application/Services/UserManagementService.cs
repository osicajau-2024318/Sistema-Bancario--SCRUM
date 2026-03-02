using AuthServiceBanco.Application.DTOs;
using AuthServiceBanco.Application.Interfaces;
using AuthServiceBanco.Domain.Constants;
using AuthServiceBanco.Domain.Entities;
using AuthServiceBanco.Domain.Interfaces;

namespace AuthServiceBanco.Application.Services;

public class UserManagementService(IUserRepository users, IRoleRepository roles, ICloudinaryService cloudinary) : IUserManagementService
{
    public async Task<UserResponseDto> UpdateUserRoleAsync(string userId, string roleName)
    {
        // Normalize
        roleName = roleName?.Trim().ToUpperInvariant() ?? string.Empty;

        // Validate inputs
        if (string.IsNullOrWhiteSpace(userId)) throw new ArgumentException("Invalid userId", nameof(userId));
        if (!RoleConstants.AllowedRoles.Contains(roleName))
            throw new InvalidOperationException($"Role not allowed. Use {RoleConstants.ADMIN_ROLE} or {RoleConstants.USER_ROLE}");

        // Load user with roles
        var user = await users.GetByIdAsync(userId);

        // If demoting an admin, prevent removing last admin
        var isUserAdmin = user.UserRoles.Any(r => r.Role.Name == RoleConstants.ADMIN_ROLE);
        if (isUserAdmin && roleName != RoleConstants.ADMIN_ROLE)
        {
            var adminCount = await roles.CountUsersInRoleAsync(RoleConstants.ADMIN_ROLE);

            if (adminCount <= 1)
            {
                throw new InvalidOperationException("Cannot remove the last administrator");
            }
        }

        // Find role entity
        var role = await roles.GetByNameAsync(roleName)
                       ?? throw new InvalidOperationException($"Role {roleName} not found");

        // Update role using repository method
        await users.UpdateUserRoleAsync(userId, role.Id);

        // Reload user with updated roles
        user = await users.GetByIdAsync(userId);

        // Map to response
        return MapToUserResponseDto(user, role.Name);
    }

    public async Task<IReadOnlyList<string>> GetUserRolesAsync(string userId)
    {
        var roleNames = await roles.GetUserRoleNamesAsync(userId);
        return roleNames;
    }

    public async Task<IReadOnlyList<UserResponseDto>> GetUsersByRoleAsync(string roleName)
    {
        roleName = roleName?.Trim().ToUpperInvariant() ?? string.Empty;
        var usersInRole = await roles.GetUsersByRoleAsync(roleName);
        return usersInRole.Select(u => MapToUserResponseDto(u, roleName)).ToList();
    }

    public async Task<UserResponseDto?> GetUserByIdAsync(string userId)
    {
        var user = await users.GetByIdAsync(userId);
        if (user == null) return null;

        var userRole = user.UserRoles.FirstOrDefault()?.Role?.Name ?? RoleConstants.USER_ROLE;
        return MapToUserResponseDto(user, userRole);
    }

    private UserResponseDto MapToUserResponseDto(User user, string roleName)
    {
        return new UserResponseDto
        {
            Id = user.Id,
            Name = user.Name,
            Surname = user.Surname,
            Username = user.Username,
            Email = user.Email,
            ProfilePicture = cloudinary.GetFullImageUrl(user.UserProfile?.ProfilePicture ?? string.Empty),
            Phone = user.UserProfile?.Phone ?? string.Empty,
            Address = user.UserProfile?.Address ?? string.Empty,
            Dpi = user.UserProfile?.Dpi ?? string.Empty,
            WorkName = user.UserProfile?.WorkName ?? string.Empty,
            MonthlyIncome = user.UserProfile?.MonthlyIncome ?? 0,
            Role = roleName,
            Status = user.Status,
            IsEmailVerified = user.UserEmail?.EmailVerified ?? false,
            CreatedAt = user.CreatedAt,
            UpdatedAt = user.UpdatedAt
        };
    }

    public async Task<UserResponseDto> UpdateProfileAsync(string userId, UpdateProfileDto dto)
    {
        var user = await users.GetByIdAsync(userId);

        // Actualizar datos básicos del usuario (solo nombre y apellido)
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

        var userRole = user.UserRoles.FirstOrDefault()?.Role?.Name ?? RoleConstants.USER_ROLE;
        return MapToUserResponseDto(user, userRole);
    }
}
