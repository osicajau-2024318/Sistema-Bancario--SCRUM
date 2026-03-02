using AuthServiceBanco.Application.DTOs.Admin;
using AuthServiceBanco.Application.Interfaces;
using AuthServiceBanco.Domain.Constants;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using System.Security.Claims;

namespace AuthServiceBanco.Api.Controllers;

[ApiController]
[Route("api/v1/admin")]
[Authorize]
public class AdminController(
    IAdminService adminService,
    IUserManagementService userManagementService
) : ControllerBase
{
    private Task<bool> CurrentUserIsAdmin()
    {
        var role = User.Claims.FirstOrDefault(c => c.Type == "role")?.Value
                   ?? User.Claims.FirstOrDefault(c => c.Type == ClaimTypes.Role)?.Value;

        return Task.FromResult(string.Equals(role, RoleConstants.ADMIN_ROLE, StringComparison.Ordinal));
    }

    [HttpPost("create-client")]
    public async Task<IActionResult> CreateClient([FromBody] CreateClientDto dto)
    {
        if (!await CurrentUserIsAdmin())
            return StatusCode(403, new { success = false, message = "Forbidden" });

        var result = await adminService.CreateClientAsync(dto);
        return Ok(new { success = true, data = result });
    }

    [HttpGet("users")]
    public async Task<IActionResult> GetAllUsers(
        [FromQuery] int page = 1,
        [FromQuery] int pageSize = 10,
        [FromQuery] string? searchTerm = null,
        [FromQuery] string? role = null)
    {
        if (!await CurrentUserIsAdmin())
            return StatusCode(403, new { success = false, message = "Forbidden" });

        var result = await adminService.GetAllUsersAsync(page, pageSize, searchTerm, role);
        return Ok(new { success = true, data = result });
    }

    [HttpGet("users/{userId}")]
    public async Task<IActionResult> GetUserById(string userId)
    {
        if (!await CurrentUserIsAdmin())
            return StatusCode(403, new { success = false, message = "Forbidden" });

        var result = await adminService.GetUserByIdAsync(userId);
        return Ok(new { success = true, data = result });
    }

    [HttpPut("users/{userId}")]
    public async Task<IActionResult> UpdateUser(string userId, [FromBody] UpdateUserDto dto)
    {
        if (!await CurrentUserIsAdmin())
            return StatusCode(403, new { success = false, message = "Forbidden" });

        var result = await adminService.UpdateUserAsync(userId, dto);
        return Ok(new { success = true, data = result, message = "Usuario actualizado correctamente" });
    }

    [HttpDelete("users/{userId}")]
    public async Task<IActionResult> DeleteUser(string userId)
    {
        if (!await CurrentUserIsAdmin())
            return StatusCode(403, new { success = false, message = "Forbidden" });

        var result = await adminService.DeleteUserAsync(userId);
        return Ok(new { success = true, message = "Usuario eliminado correctamente" });
    }
}
