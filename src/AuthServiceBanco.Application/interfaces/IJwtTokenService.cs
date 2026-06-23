
using AuthServiceBanco.Domain.Entities;

namespace AuthServiceBanco.Application.Interfaces;

public interface IJwtTokenService
{
    string GenerateToken(User user);
    string GenerateRefreshToken(User user);
    string? GetUserIdFromRefreshToken(string refreshToken);
}