using System.ComponentModel.DataAnnotations;

namespace AuthServiceBanco.Domain.Entities;

public class LoginHistory
{
    public Guid Id { get; set; }
    public Guid UserId { get; set; }
    public string IpAddress { get; set; } = string.Empty;
    public string Country { get; set; } = string.Empty;
    public DateTime LoginDate { get; set; } = DateTime.UtcNow;
}
