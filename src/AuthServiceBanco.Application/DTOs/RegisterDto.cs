
using System.ComponentModel.DataAnnotations;
using AuthServiceBanco.Application.Interfaces;

namespace AuthServiceBanco.Application.DTOs;

public class RegisterDto
{
    [Required]
    [MaxLength(25)]
    public string Name { get; set; } = string.Empty;

    [Required]
    [MaxLength(25)]
    public string Surname { get; set; } = string.Empty;

    [Required]
    public string Username { get; set; } = string.Empty;

    [Required]
    [EmailAddress]
    public string Email { get; set; } = string.Empty;

    [Required]
    [MinLength(8)]
    public string Password { get; set; } = string.Empty;

    [Required]
    [StringLength(8, MinimumLength = 8)]
    public string Phone { get; set; } = string.Empty;

    [MaxLength(100)]
    public string? Address { get; set; }

    [StringLength(13, MinimumLength = 13, ErrorMessage = "El DPI debe tener exactamente 13 dígitos")]
    public string? Dpi { get; set; }

    [MaxLength(50)]
    public string? WorkName { get; set; }

    public decimal? MonthlyIncome { get; set; }

    public IFileData? ProfilePicture { get; set; }
}