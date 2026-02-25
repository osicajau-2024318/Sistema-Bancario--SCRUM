using System.ComponentModel.DataAnnotations;

namespace AuthServiceBanco.Application.DTOs.Email;

public class ForgotPasswordDto
{
    [Required]
    [EmailAddress]
    public string Email { get; set; } = string.Empty;
}