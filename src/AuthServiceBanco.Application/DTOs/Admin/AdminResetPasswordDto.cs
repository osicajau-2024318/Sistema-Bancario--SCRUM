using System.ComponentModel.DataAnnotations;

namespace AuthServiceBanco.Application.DTOs.Admin;

/// <summary>
/// DTO usado por el administrador para resetear directamente la contraseña de un usuario,
/// sin requerir el flujo de email + token. Pensado para gestión interna, recuperación
/// asistida o reseteos de datos de demo.
/// </summary>
public class AdminResetPasswordDto
{
    [Required(ErrorMessage = "La nueva contraseña es obligatoria")]
    [MinLength(6, ErrorMessage = "La nueva contraseña debe tener al menos 6 caracteres")]
    [MaxLength(100, ErrorMessage = "La nueva contraseña no puede exceder 100 caracteres")]
    public string NewPassword { get; set; } = string.Empty;
}
