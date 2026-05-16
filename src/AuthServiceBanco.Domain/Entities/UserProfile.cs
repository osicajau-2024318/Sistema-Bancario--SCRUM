using System.ComponentModel.DataAnnotations;

namespace AuthServiceBanco.Domain.Entities;
public class UserProfile
{
    [Key]
    [MaxLength(16)]
    public string Id { get; set;} = string.Empty;

    [Required]
    [MaxLength(16)]
    public string UserId { get; set; } = string.Empty;

    [MaxLength(512)]
    public string ProfilePicture { get; set; } = string.Empty;

    [Required]
    [StringLength(8, MinimumLength = 8)]
    public string Phone { get; set; } = string.Empty;

    [MaxLength(100)]
    public string Address { get; set; } = string.Empty;

    [MaxLength(13)]
    public string Dpi { get; set; } = string.Empty;

    [MaxLength(50)]
    public string WorkName { get; set; } = string.Empty;

    public decimal MonthlyIncome { get; set; }

    [Required]
    public User User { get; set; } = null!;
}
