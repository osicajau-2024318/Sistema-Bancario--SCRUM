using AuthServiceBanco.Application.DTOs;

namespace AuthServiceBanco.Application.Interfaces;

public interface IUserManagementService
{
    Task<UserResponseDto> UpdateUserRoleAsync(string userId, string roleName);
    Task<IReadOnlyList<string>> GetUserRolesAsync(string userId);
    Task<IReadOnlyList<UserResponseDto>> GetUsersByRoleAsync(string roleName);
    Task<UserResponseDto?> GetUserByIdAsync(string userId);
    Task<UserResponseDto> UpdateProfileAsync(string userId, UpdateProfileDto dto);
}
