using AuthServiceBanco.Application.DTOs;
using AuthServiceBanco.Application.DTOs.Email;
using AuthServiceBanco.Domain.Entities;

namespace AuthServiceBanco.Application.Interfaces;

public interface IAuthService
{
    Task<RegisterResponseDto> RegisterAsync(RegisterDto registerDto);
    Task<AuthResponseDto> LoginAsync(LoginDto loginDto);
    Task<EmailResponseDto> VerifyEmailAsync(VerifyEmailDto verifyEmailDto);
    Task<EmailResponseDto> ResendVerificationEmailAsync(ResendVerificationDto resendDto);
    Task<EmailResponseDto> ForgotPasswordAsync(ForgotPasswordDto forgotPasswordDto);
    Task<EmailResponseDto> ResetPasswordAsync(ResetPasswordDto resetPasswordDto);
    Task<UserResponseDto?> GetUserByIdAsync(string userId);
    Task RegisterLoginHistoryAsync(string userId, string ipAddress);
    Task<IEnumerable<LoginHistory>> GetLoginHistoryAsync(string userId);
}