using System;
using System.Security.Claims;
using AuthServiceBanco.Application.DTOs;
using AuthServiceBanco.Application.Interfaces;
using AuthServiceBanco.Domain.Constants;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace AuthServiceBanco.Api.Controllers;

[ApiController]
[Route("api/v1/users")]
public class UserProfileController(IUserManagementService userManagementService) : ControllerBase
{
    [HttpGet("{userId}/exists")]
    public async Task<IActionResult> UserExists(string userId)
    {
        var user = await userManagementService.GetUserByIdAsync(userId);
        return Ok(new { exists = user != null });
    }

    [HttpGet("{userId}/profile")]
    [Authorize]
    public async Task<IActionResult> GetUserProfile(string userId)
    {
        var user = await userManagementService.GetUserByIdAsync(userId);
        if (user == null)
        {
            return NotFound(new { success = false, message = "Usuario no encontrado" });
        }

        var currentUserId = User.Claims.FirstOrDefault(c => c.Type == "sub")?.Value;
        var role = User.Claims.FirstOrDefault(c => c.Type == "role")?.Value
                   ?? User.Claims.FirstOrDefault(c => c.Type == ClaimTypes.Role)?.Value;

        if (!string.Equals(role, RoleConstants.ADMIN_ROLE, StringComparison.Ordinal) &&
            !string.Equals(currentUserId, userId, StringComparison.Ordinal))
        {
            return StatusCode(403, new { success = false, message = "Forbidden" });
        }

        return Ok(new
        {
            success = true,
            userId = user.Id,
            name = user.Name,
            surname = user.Surname,
            username = user.Username,
            email = user.Email,
            phone = user.Phone,
            monthlyIncome = user.MonthlyIncome,
            address = user.Address,
            dpi = user.Dpi,
            workName = user.WorkName
        });
    }

    [HttpGet("me")]
    [Authorize]
    public async Task<IActionResult> GetMyProfile()
    {
        var userId = User.Claims.FirstOrDefault(c => c.Type == "sub")?.Value
             ?? User.Claims.FirstOrDefault(c => c.Type == "http://schemas.xmlsoap.org/ws/2005/05/identity/claims/nameidentifier")?.Value;
        if (string.IsNullOrEmpty(userId))
        {
            return Unauthorized(new { success = false, message = "Usuario no autenticado" });
        }

        var user = await userManagementService.GetUserByIdAsync(userId);
        if (user == null)
        {
            return NotFound(new { success = false, message = "Usuario no encontrado" });
        }

        return Ok(new { success = true, data = user });
    }

    [HttpPut("me")]
    [Authorize]
    public async Task<IActionResult> UpdateMyProfile([FromBody] UpdateProfileDto dto)
    {
        var userId = User.Claims.FirstOrDefault(c => c.Type == "sub")?.Value;
        if (string.IsNullOrEmpty(userId))
        {
            return Unauthorized(new { success = false, message = "Usuario no autenticado" });
        }

        var result = await userManagementService.UpdateProfileAsync(userId, dto);
        return Ok(new { success = true, data = result, message = "Perfil actualizado correctamente" });
    }
}
