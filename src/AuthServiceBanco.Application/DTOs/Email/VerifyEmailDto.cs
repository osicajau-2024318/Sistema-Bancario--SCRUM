using System.ComponentModel.DataAnnotations;

namespace AuthServiceBanco.Application.DTOs.Email;

public class VerifyEmailDto
{
    [Required]
    public string Token { get; set; } = string.Empty;
}