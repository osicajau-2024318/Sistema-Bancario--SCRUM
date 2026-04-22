using AuthServiceBanco.Application.DTOs;
using AuthServiceBanco.Application.Interfaces;
using AuthServiceBanco.Domain.Constants;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.RateLimiting;

namespace AuthServiceBanco.Api.Controllers;

/// <summary>
/// Consulta y modificación de roles de usuario (relación usuario–rol).
/// </summary>
/// <remarks>
/// Los roles permitidos en el sistema están definidos en <see cref="RoleConstants"/>: <c>ADMIN_ROLE</c> y <c>USER_ROLE</c>.
/// Cambiar el rol de un administrador a usuario puede fallar si es el único administrador (conflicto 409).
/// </remarks>
[ApiController]
[Route("api/v1/[controller]")]
[Produces("application/json")]
public class UsersController(IUserManagementService userManagementService) : ControllerBase
{
    private async Task<bool> CurrentUserIsAdmin()
    {
        var userId = User.Claims.FirstOrDefault(c => c.Type == "sub" || c.Type == "http://schemas.xmlsoap.org/ws/2005/05/identity/claims/nameidentifier")?.Value;
        if (string.IsNullOrEmpty(userId)) return false;
        var roles = await userManagementService.GetUserRolesAsync(userId);
        return roles.Contains(RoleConstants.ADMIN_ROLE);
    }

    /// <summary>
    /// Asigna el rol de un usuario (ADMIN_ROLE o USER_ROLE). Solo administradores.
    /// </summary>
    /// <param name="userId">Usuario cuyo rol se actualizará.</param>
    /// <param name="dto">Nombre del rol en mayúsculas, p. ej. USER_ROLE.</param>
    /// <returns>Usuario con datos actualizados incluyendo el nuevo rol.</returns>
    /// <response code="200">Rol actualizado.</response>
    /// <response code="400">Rol no permitido o no encontrado.</response>
    /// <response code="401">Token ausente o inválido.</response>
    /// <response code="403">El solicitante no es administrador.</response>
    /// <response code="409">No se puede dejar al sistema sin al menos un administrador.</response>
    [HttpPut("{userId}/role")]
    [Authorize]
    [EnableRateLimiting("ApiPolicy")]
    [ProducesResponseType(typeof(UserResponseDto), StatusCodes.Status200OK)]
    [ProducesResponseType(typeof(object), StatusCodes.Status400BadRequest)]
    [ProducesResponseType(typeof(object), StatusCodes.Status401Unauthorized)]
    [ProducesResponseType(typeof(object), StatusCodes.Status403Forbidden)]
    [ProducesResponseType(typeof(object), StatusCodes.Status409Conflict)]
    public async Task<ActionResult<UserResponseDto>> UpdateUserRole(string userId, [FromBody] UpdateUserRoleDto dto)
    {
        if (!await CurrentUserIsAdmin())
        {
            return StatusCode(403, new { success = false, message = "Forbidden" });
        }

        var result = await userManagementService.UpdateUserRoleAsync(userId, dto.RoleName);
        return Ok(result);
    }

    /// <summary>
    /// Lista los nombres de rol asignados a un usuario (normalmente uno: ADMIN_ROLE o USER_ROLE).
    /// </summary>
    /// <param name="userId">Usuario a consultar.</param>
    /// <returns>Lista de cadenas con nombres de rol.</returns>
    /// <response code="200">Lista de roles.</response>
    /// <response code="401">Token ausente o inválido.</response>
    [HttpGet("{userId}/roles")]
    [Authorize]
    [ProducesResponseType(typeof(IReadOnlyList<string>), StatusCodes.Status200OK)]
    [ProducesResponseType(typeof(object), StatusCodes.Status401Unauthorized)]
    public async Task<ActionResult<IReadOnlyList<string>>> GetUserRoles(string userId)
    {
        var roles = await userManagementService.GetUserRolesAsync(userId);
        return Ok(roles);
    }

    /// <summary>
    /// Obtiene todos los usuarios que tienen un rol determinado. Solo administradores.
    /// </summary>
    /// <param name="roleName">Nombre del rol (p. ej. USER_ROLE).</param>
    /// <returns>Lista de usuarios con ese rol.</returns>
    /// <response code="200">Listado obtenido.</response>
    /// <response code="401">Token ausente o inválido.</response>
    /// <response code="403">No es administrador.</response>
    [HttpGet("by-role/{roleName}")]
    [Authorize]
    [EnableRateLimiting("ApiPolicy")]
    [ProducesResponseType(typeof(IReadOnlyList<UserResponseDto>), StatusCodes.Status200OK)]
    [ProducesResponseType(typeof(object), StatusCodes.Status401Unauthorized)]
    [ProducesResponseType(typeof(object), StatusCodes.Status403Forbidden)]
    public async Task<ActionResult<IReadOnlyList<UserResponseDto>>> GetUsersByRole(string roleName)
    {
        if (!await CurrentUserIsAdmin())
        {
            return StatusCode(403, new { success = false, message = "Forbidden" });
        }

        var users = await userManagementService.GetUsersByRoleAsync(roleName);
        return Ok(users);
    }
}
