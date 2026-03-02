namespace AuthServiceBanco.Application.DTOs.Admin;

public class UpdateUserDto
{
    public string? Name { get; set; }
    public string? Surname { get; set; }
    public string? Address { get; set; }
    public string? Phone { get; set; }
    public string? WorkName { get; set; }
    public decimal? MonthlyIncome { get; set; }
}
