using AuthServiceBanco.Application.DTOs.Admin;
using AuthServiceBanco.Application.DTOs;

namespace AuthServiceBanco.Application.Interfaces;

public interface IAdminService
{
    Task<UserResponseDto> CreateClientAsync(CreateClientDto dto);
    Task<PagedResultDto<UserResponseDto>> GetAllUsersAsync(int page = 1, int pageSize = 10, string? searchTerm = null, string? role = null);
    Task<UserResponseDto> GetUserByIdAsync(string userId);
    Task<UserResponseDto> UpdateUserAsync(string userId, UpdateUserDto dto);
    Task<bool> DeleteUserAsync(string userId);
    Task<UserResponseDto> ActivateUserAccountAsync(string userId);
}