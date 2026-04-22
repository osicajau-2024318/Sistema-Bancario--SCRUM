using AuthServiceBanco.Application.DTOs;
using AuthServiceBanco.Application.DTOs.Admin;
using AuthServiceBanco.Application.Interfaces;
using AuthServiceBanco.Domain.Constants;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using System.Security.Claims;

namespace AuthServiceBanco.Api.Controllers;

/// <summary>
/// Administración de usuarios del sistema (solo rol administrador).
/// </summary>
/// <remarks>
/// Requiere JWT con claim de rol <c>ADMIN_ROLE</c>. Las operaciones crean o gestionan usuarios/clientes en PostgreSQL.
/// </remarks>
[ApiController]
[Route("api/v1/admin")]
[Authorize]
[Produces("application/json")]
public class AdminController(IAdminService adminService) : ControllerBase
{
    private Task<bool> CurrentUserIsAdmin()
    {
        var role = User.Claims.FirstOrDefault(c => c.Type == "role")?.Value
                   ?? User.Claims.FirstOrDefault(c => c.Type == ClaimTypes.Role)?.Value;

        return Task.FromResult(string.Equals(role, RoleConstants.ADMIN_ROLE, StringComparison.Ordinal));
    }

    /// <summary>
    /// Crea un usuario cliente con perfil completo y rol USER_ROLE.
    /// </summary>
    /// <param name="dto">Datos del cliente: nombre, DPI, correo, contraseña, ingresos mensuales (mínimo Q100), etc.</param>
    /// <returns>Usuario creado con datos de perfil y rol.</returns>
    /// <response code="200">Cliente creado correctamente.</response>
    /// <response code="400">Validación de negocio (correo/usuario/DPI duplicado, ingresos &lt; Q100, etc.).</response>
    /// <response code="401">Token ausente o inválido.</response>
    /// <response code="403">El usuario autenticado no es administrador.</response>
    [HttpPost("create-client")]
    [ProducesResponseType(typeof(object), StatusCodes.Status200OK)]
    [ProducesResponseType(typeof(object), StatusCodes.Status400BadRequest)]
    [ProducesResponseType(typeof(object), StatusCodes.Status401Unauthorized)]
    [ProducesResponseType(typeof(object), StatusCodes.Status403Forbidden)]
    public async Task<IActionResult> CreateClient([FromBody] CreateClientDto dto)
    {
        if (!await CurrentUserIsAdmin())
            return StatusCode(403, new { success = false, message = "Forbidden" });

        var result = await adminService.CreateClientAsync(dto);
        return Ok(new { success = true, data = result });
    }

    /// <summary>
    /// Lista usuarios con paginación y filtros opcionales por texto y rol.
    /// </summary>
    /// <param name="page">Número de página (por defecto 1).</param>
    /// <param name="pageSize">Tamaño de página (1–100; por defecto 10).</param>
    /// <param name="searchTerm">Búsqueda opcional en datos de usuario.</param>
    /// <param name="role">Filtro opcional por nombre de rol (p. ej. USER_ROLE, ADMIN_ROLE).</param>
    /// <returns>Lista paginada de usuarios y metadatos de paginación.</returns>
    /// <response code="200">Listado obtenido.</response>
    /// <response code="401">Token ausente o inválido.</response>
    /// <response code="403">No es administrador.</response>
    [HttpGet("users")]
    [ProducesResponseType(typeof(object), StatusCodes.Status200OK)]
    [ProducesResponseType(typeof(object), StatusCodes.Status401Unauthorized)]
    [ProducesResponseType(typeof(object), StatusCodes.Status403Forbidden)]
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

    /// <summary>
    /// Obtiene el detalle de un usuario por su identificador.
    /// </summary>
    /// <param name="userId">Identificador del usuario (16 caracteres).</param>
    /// <returns>Datos del usuario y perfil.</returns>
    /// <response code="200">Usuario encontrado.</response>
    /// <response code="401">Token ausente o inválido.</response>
    /// <response code="403">No es administrador.</response>
    /// <response code="404">Usuario no existe (puede devolverse como error de negocio según repositorio).</response>
    [HttpGet("users/{userId}")]
    [ProducesResponseType(typeof(object), StatusCodes.Status200OK)]
    [ProducesResponseType(typeof(object), StatusCodes.Status401Unauthorized)]
    [ProducesResponseType(typeof(object), StatusCodes.Status403Forbidden)]
    public async Task<IActionResult> GetUserById(string userId)
    {
        if (!await CurrentUserIsAdmin())
            return StatusCode(403, new { success = false, message = "Forbidden" });

        var result = await adminService.GetUserByIdAsync(userId);
        return Ok(new { success = true, data = result });
    }

    /// <summary>
    /// Actualiza datos básicos y de perfil de un usuario. No puede editar a otro administrador salvo su propia cuenta.
    /// </summary>
    /// <param name="userId">Usuario a modificar.</param>
    /// <param name="dto">Campos opcionales: nombre, apellido, dirección, teléfono, trabajo, ingresos (≥ Q100).</param>
    /// <returns>Usuario actualizado.</returns>
    /// <response code="200">Actualización correcta.</response>
    /// <response code="400">Reglas de negocio (p. ej. editar otro admin, ingresos inválidos).</response>
    /// <response code="401">Usuario no autenticado o token inválido.</response>
    /// <response code="403">No es administrador.</response>
    [HttpPut("users/{userId}")]
    [ProducesResponseType(typeof(object), StatusCodes.Status200OK)]
    [ProducesResponseType(typeof(object), StatusCodes.Status400BadRequest)]
    [ProducesResponseType(typeof(object), StatusCodes.Status401Unauthorized)]
    [ProducesResponseType(typeof(object), StatusCodes.Status403Forbidden)]
    public async Task<IActionResult> UpdateUser(string userId, [FromBody] UpdateUserDto dto)
    {
        if (!await CurrentUserIsAdmin())
            return StatusCode(403, new { success = false, message = "Forbidden" });

        var currentUserId = User.Claims.FirstOrDefault(c => c.Type == "sub")?.Value
                            ?? User.Claims.FirstOrDefault(c => c.Type == ClaimTypes.NameIdentifier)?.Value;
        if (string.IsNullOrEmpty(currentUserId))
            return Unauthorized(new { success = false, message = "Usuario no autenticado" });

        var result = await adminService.UpdateUserAsync(userId, dto, currentUserId);
        return Ok(new { success = true, data = result, message = "Usuario actualizado correctamente" });
    }

    /// <summary>
    /// Elimina un usuario cliente. No permite eliminar administradores.
    /// </summary>
    /// <param name="userId">Identificador del usuario a eliminar.</param>
    /// <response code="200">Eliminación correcta.</response>
    /// <response code="400">Intento de eliminar un administrador u otra regla de negocio.</response>
    /// <response code="401">Token ausente o inválido.</response>
    /// <response code="403">No es administrador.</response>
    [HttpDelete("users/{userId}")]
    [ProducesResponseType(typeof(object), StatusCodes.Status200OK)]
    [ProducesResponseType(typeof(object), StatusCodes.Status400BadRequest)]
    [ProducesResponseType(typeof(object), StatusCodes.Status401Unauthorized)]
    [ProducesResponseType(typeof(object), StatusCodes.Status403Forbidden)]
    public async Task<IActionResult> DeleteUser(string userId)
    {
        if (!await CurrentUserIsAdmin())
            return StatusCode(403, new { success = false, message = "Forbidden" });

        await adminService.DeleteUserAsync(userId);
        return Ok(new { success = true, message = "Usuario eliminado correctamente" });
    }

    /// <summary>
    /// Activa la cuenta de un usuario: estado de cuenta ACTIVA, usuario habilitado y correo marcado como verificado.
    /// </summary>
    /// <param name="userId">Usuario a activar.</param>
    /// <returns>Datos del usuario tras la activación.</returns>
    /// <response code="200">Cuenta activada.</response>
    /// <response code="401">Token ausente o inválido.</response>
    /// <response code="403">No es administrador.</response>
    [HttpPost("users/{userId}/activate")]
    [ProducesResponseType(typeof(object), StatusCodes.Status200OK)]
    [ProducesResponseType(typeof(object), StatusCodes.Status401Unauthorized)]
    [ProducesResponseType(typeof(object), StatusCodes.Status403Forbidden)]
    public async Task<IActionResult> ActivateUser(string userId)
    {
        if (!await CurrentUserIsAdmin())
            return StatusCode(403, new { success = false, message = "Forbidden" });

        var result = await adminService.ActivateUserAccountAsync(userId);
        return Ok(new { success = true, data = result, message = "Cuenta activada correctamente" });
    }
}
