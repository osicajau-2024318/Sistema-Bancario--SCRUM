
using AuthServiceBanco.Domain.Entities;

namespace AuthServiceBanco.Application.Interfaces;

public interface IJwtTokenService
{
    string GenerateToken(User user);
}