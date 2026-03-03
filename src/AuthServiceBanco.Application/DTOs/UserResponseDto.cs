namespace AuthServiceBanco.Application.DTOs;

public class UserResponseDto
{
    public string Id { get; set; } = string.Empty;
    public string Name { get; set; } = string.Empty;
    public string Surname { get; set; } = string.Empty;
    public string Username { get; set; } = string.Empty;
    public string Email { get; set; } = string.Empty;
    public string ProfilePicture { get; set; } = string.Empty;
    public string Phone { get; set; } = string.Empty;
    public string Address { get; set; } = string.Empty;
    public string Dpi { get; set; } = string.Empty;
    public string WorkName { get; set; } = string.Empty;
    public decimal MonthlyIncome { get; set; }
    public string Role { get; set; } = string.Empty;
    public bool Status { get; set; }
    public bool IsEmailVerified { get; set; }
    public string AccountState { get; set; } = string.Empty;
    public DateTime CreatedAt { get; set; }
    public DateTime UpdatedAt { get; set; }
}