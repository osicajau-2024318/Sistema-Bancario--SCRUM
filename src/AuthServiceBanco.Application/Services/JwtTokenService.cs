using AuthServiceBanco.Application.Interfaces;
using AuthServiceBanco.Domain.Constants;
using AuthServiceBanco.Domain.Entities;
using Microsoft.Extensions.Configuration;
using Microsoft.IdentityModel.Tokens;
using System.IdentityModel.Tokens.Jwt;
using System.Security.Claims;
using System.Text;
namespace AuthServiceBanco.Application.Services;

public class JwtTokenService(IConfiguration configuration) : IJwtTokenService
{
    public string GenerateToken(User user)
    {
        var jwtSettings = configuration.GetSection("JwtSettings");
        var secretKey = jwtSettings["SecretKey"] ?? throw new InvalidOperationException("JWT SecretKey not configured");
        var issuer = jwtSettings["Issuer"] ?? "AuthDotnet";
        var audience = jwtSettings["Audience"] ?? "AuthDotnet";
        var expiryInMinutes = int.Parse(jwtSettings["ExpiryInMinutes"] ?? "30");

        var key = new SymmetricSecurityKey(Encoding.UTF8.GetBytes(secretKey));
        var credentials = new SigningCredentials(key, SecurityAlgorithms.HmacSha256);

        // Obtiene todos los roles del usuario; si tiene varios, ADMIN_ROLE tiene prioridad
        // para que controllers que validan rol contra el JWT vean siempre el rol mas alto
        var roleNames = user.UserRoles?
            .Select(ur => ur.Role?.Name)
            .Where(name => !string.IsNullOrEmpty(name))
            .Cast<string>()
            .Distinct()
            .ToArray() ?? Array.Empty<string>();

        var primaryRole = roleNames.Contains(RoleConstants.ADMIN_ROLE)
            ? RoleConstants.ADMIN_ROLE
            : (roleNames.FirstOrDefault() ?? RoleConstants.USER_ROLE);

        var claims = new List<Claim>
        {
            new Claim(JwtRegisteredClaimNames.Sub, user.Id),
            new Claim(JwtRegisteredClaimNames.Jti, Guid.NewGuid().ToString()),
            new Claim(JwtRegisteredClaimNames.Iat, DateTimeOffset.UtcNow.ToUnixTimeSeconds().ToString(), ClaimValueTypes.Integer64),
            new Claim("role", primaryRole)
        };

        // Emite un claim "role" adicional por cada rol extra del usuario
        // para soportar autorizacion sobre cualquiera de sus roles asignados
        foreach (var extraRole in roleNames.Where(r => r != primaryRole))
        {
            claims.Add(new Claim("role", extraRole));
        }

        var token = new JwtSecurityToken(
            issuer: issuer,
            audience: audience,
            claims: claims,
            expires: DateTime.UtcNow.AddMinutes(expiryInMinutes),
            signingCredentials: credentials
        );

        return new JwtSecurityTokenHandler().WriteToken(token);
    }
}
