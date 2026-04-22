using AuthServiceBanco.Application.DTOs;
using AuthServiceBanco.Application.Interfaces;
using AuthServiceBanco.Application.Exceptions;
using AuthServiceBanco.Application.Extensions;
using AuthServiceBanco.Application.Validators;
using AuthServiceBanco.Domain.Constants;
using AuthServiceBanco.Domain.Entities;
using AuthServiceBanco.Domain.Interfaces;
using AuthServiceBanco.Domain.Enums;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.Logging;
using AuthServiceBanco.Application.DTOs.Email;

namespace AuthServiceBanco.Application.Services;

public class AuthService(
    IUserRepository userRepository,
    IRoleRepository roleRepository,
    IPasswordHashService passwordHashService,
    IJwtTokenService jwtTokenService,
    ICloudinaryService cloudinaryService,
    IEmailService emailService,
    IConfiguration configuration,
    ILogger<AuthService> logger) : IAuthService
{
    private readonly ICloudinaryService _cloudinaryService = cloudinaryService;
    public async Task<RegisterResponseDto> RegisterAsync(RegisterDto registerDto)
    {
        // Verificar si el email ya existe
        if (await userRepository.ExistsByEmailAsync(registerDto.Email))
        {
            logger.LogRegistrationWithExistingEmail();
            throw new BusinessException(ErrorCodes.EMAIL_ALREADY_EXISTS, "Email already exists");
        }

        // Verificar si el username ya existe
        if (await userRepository.ExistsByUsernameAsync(registerDto.Username))
        {
            logger.LogRegistrationWithExistingUsername();
            throw new BusinessException(ErrorCodes.USERNAME_ALREADY_EXISTS, "Username already exists");
        }

        // Verificar si el DPI ya existe
        if (!string.IsNullOrWhiteSpace(registerDto.Dpi) && await userRepository.ExistsByDpiAsync(registerDto.Dpi))
        {
            // Registrar si hay un logger específico no está implementado, usar mensaje consistente en español
            throw new BusinessException(ErrorCodes.DPI_ALREADY_EXISTS, "Cuenta con DPI ya existente");
        }

        // Validar y manejar la imagen de perfil
        string profilePicturePath = _cloudinaryService.GetDefaultAvatarUrl();
        

        // Crear nuevo usuario y entidades relacionadas
        var emailVerificationToken = TokenGeneratorService.GenerateEmailVerificationToken();

        var userId = UuidGenerator.GenerateUserId();
        var userProfileId = UuidGenerator.GenerateUserId();
        var userEmailId = UuidGenerator.GenerateUserId();
        var userRoleId = UuidGenerator.GenerateUserId();

        // Obtener el rol por defecto (USER_ROLE) ya seedado en DB
        var defaultRole = await roleRepository.GetByNameAsync(RoleConstants.USER_ROLE);
        if (defaultRole == null)
        {
            throw new InvalidOperationException($"Default role '{RoleConstants.USER_ROLE}' not found. Ensure seeding runs before registration.");
        }

            var user = new User
        {
            Id = userId,
            Name = registerDto.Name,
            Surname = registerDto.Surname,
            Username = registerDto.Username,
            Email = registerDto.Email.ToLowerInvariant(),
            Password = passwordHashService.HashPassword(registerDto.Password),
                Status = false,
                AccountState = Domain.Enums.AccountState.PENDIENTE,
            UserProfile = new UserProfile
            {
                Id = userProfileId,
                UserId = userId,
                ProfilePicture = profilePicturePath,
                Phone = registerDto.Phone,
                Address = registerDto.Address ?? string.Empty,
                Dpi = registerDto.Dpi ?? string.Empty,
                WorkName = registerDto.WorkName ?? string.Empty,
                MonthlyIncome = registerDto.MonthlyIncome ?? 0
            },
            UserEmail = new UserEmail
            {
                Id = userEmailId,
                UserId = userId,
                EmailVerified = false,
                EmailVerificationToken = emailVerificationToken,
                EmailVerificationTokenExpiry = DateTime.UtcNow.AddHours(24)
            },
            UserRoles =
            [
                new Domain.Entities.UserRole
                {
                    Id = userRoleId,
                    UserId = userId,
                    RoleId = defaultRole.Id
                }
            ],
            UserPasswordReset = new UserPasswordReset //Generar el objeto.
            {
                Id = UuidGenerator.GenerateUserId(),
                UserId = userId,
                PasswordResetToken = null,
                PasswordResetTokenExpiry = null
            },
        };

        // Guardar usuario y entidades relacionadas
        var createdUser = await userRepository.CreateAsync(user);

        logger.LogUserRegistered(createdUser.Username);

        // Enviar email de verificación en background
        _ = Task.Run(async () =>
        {
            try
            {
                await emailService.SendEmailVerificationAsync(createdUser.Email, createdUser.Username, emailVerificationToken);
                logger.LogInformation("Verification email sent");
            }
            catch (Exception ex)
            {
                logger.LogError(ex, "Failed to send verification email");
            }
        });

        // Crear respuesta sin JWT - solo confirmación de registro
        return new RegisterResponseDto
        {
            Success = true,
            User = MapToUserResponseDto(createdUser),
            Message = "Usuario registrado exitosamente. Por favor, verifica tu email para activar la cuenta.",
            EmailVerificationRequired = true
        };
    }

    public async Task<AuthResponseDto> LoginAsync(LoginDto loginDto)
    {
        // Buscar usuario por email o username
        User? user = null;

        if (loginDto.EmailOrUsername.Contains('@'))
        {
            // Es un email
            user = await userRepository.GetByEmailAsync(loginDto.EmailOrUsername.ToLowerInvariant());
        }
        else
        {
            // Es un username
            user = await userRepository.GetByUsernameAsync(loginDto.EmailOrUsername);
        }

        // Verificar si el usuario existe
        if (user == null)
        {
            logger.LogFailedLoginAttempt();
            throw new UnauthorizedAccessException("Invalid credentials");
        }

        // Verificar si el usuario está activo
        if (user.AccountState != Domain.Enums.AccountState.ACTIVA)
        {
            logger.LogFailedLoginAttempt();
            throw new UnauthorizedAccessException("Cuenta pendiente de activación");
        }

        // Verificar si el email ha sido verificado
        if (user.UserEmail?.EmailVerified == false)
        {
            logger.LogFailedLoginAttempt();
            throw new UnauthorizedAccessException("Email not verified. Please check your email to verify your account.");
        }

        // Verificar contraseña
        if (!passwordHashService.VerifyPassword(loginDto.Password, user.Password))
        {
            logger.LogFailedLoginAttempt();
            throw new UnauthorizedAccessException("Invalid credentials");
        }

        logger.LogUserLoggedIn();

        // Generar token JWT
        var token = jwtTokenService.GenerateToken(user);
        var expiryMinutes = int.Parse(configuration["JwtSettings:ExpiryInMinutes"] ?? "30");

        // Crear respuesta compacta
        return new AuthResponseDto
        {
            Success = true,
            Message = "Login exitoso",
            Token = token,
            UserDetails = MapToUserDetailsDto(user),
            ExpiresAt = DateTime.UtcNow.AddMinutes(expiryMinutes)
        };
    }

    private UserResponseDto MapToUserResponseDto(User user)
    {
        var userRole = user.UserRoles.FirstOrDefault()?.Role?.Name ?? RoleConstants.USER_ROLE;
        return new UserResponseDto
        {
            Id = user.Id,
            Name = user.Name,
            Surname = user.Surname,
            Username = user.Username,
            Email = user.Email,
            ProfilePicture = _cloudinaryService.GetFullImageUrl(user.UserProfile?.ProfilePicture ?? string.Empty),
            Phone = user.UserProfile?.Phone ?? string.Empty,
            Address = user.UserProfile?.Address ?? string.Empty,
            Dpi = user.UserProfile?.Dpi ?? string.Empty,
            WorkName = user.UserProfile?.WorkName ?? string.Empty,
            MonthlyIncome = user.UserProfile?.MonthlyIncome ?? 0,
            Role = userRole,
            Status = user.Status,
            IsEmailVerified = user.UserEmail?.EmailVerified ?? false,
            AccountState = user.AccountState.ToString(),
            CreatedAt = user.CreatedAt,
            UpdatedAt = user.UpdatedAt
        };
    }

    private UserDetailsDto MapToUserDetailsDto(User user)
    {
        return new UserDetailsDto
        {
            Id = user.Id,
            Username = user.Username,
            ProfilePicture = _cloudinaryService.GetFullImageUrl(user.UserProfile?.ProfilePicture ?? string.Empty),
            Role = user.UserRoles.FirstOrDefault()?.Role?.Name ?? RoleConstants.USER_ROLE
        };
    }

    public async Task<EmailResponseDto> VerifyEmailAsync(VerifyEmailDto verifyEmailDto)
    {
        var user = await userRepository.GetByEmailVerificationTokenAsync(verifyEmailDto.Token);
        if (user == null || user.UserEmail == null)
        {
            return new EmailResponseDto
            {
                Success = false,
                Message = "Invalid or expired verification token"
            };
        }

        user.UserEmail.EmailVerified = true;
        user.Status = true;
        user.UserEmail.EmailVerificationToken = null;
        user.UserEmail.EmailVerificationTokenExpiry = null;

        await userRepository.UpdateAsync(user);

        // Enviar email de bienvenida
        try
        {
            await emailService.SendWelcomeEmailAsync(user.Email, user.Username);
        }
        catch (Exception ex)
        {
            logger.LogError(ex, "Failed to send welcome email to {Email}", user.Email);
        }

        logger.LogInformation("Email verified successfully for user {Username}", user.Username);

        return new EmailResponseDto
        {
            Success = true,
            Message = "Email verificado exitosamente",
            Data = new
            {
                email = user.Email,
                verified = true
            }
        };
    }

    public async Task<EmailResponseDto> ResendVerificationEmailAsync(ResendVerificationDto resendDto)
    {
        var user = await userRepository.GetByEmailAsync(resendDto.Email);
        if (user == null || user.UserEmail == null)
        {
            return new EmailResponseDto
            {
                Success = false,
                Message = "Usuario no encontrado",
                Data = new { email = resendDto.Email, sent = false }
            };
        }

        if (user.UserEmail.EmailVerified)
        {
            return new EmailResponseDto
            {
                Success = false,
                Message = "El email ya ha sido verificado",
                Data = new { email = user.Email, verified = true }
            };
        }

        // Generar nuevo token
        var newToken = TokenGeneratorService.GenerateEmailVerificationToken();
        user.UserEmail.EmailVerificationToken = newToken;
        user.UserEmail.EmailVerificationTokenExpiry = DateTime.UtcNow.AddHours(24);

        await userRepository.UpdateAsync(user);

        // Enviar email
        try
        {
            await emailService.SendEmailVerificationAsync(user.Email, user.Username, newToken);
            return new EmailResponseDto
            {
                Success = true,
                Message = "Email de verificación enviado exitosamente",
                Data = new { email = user.Email, sent = true }
            };
        }
        catch (Exception ex)
        {
            logger.LogError(ex, "Failed to resend verification email to {Email}", user.Email);
            return new EmailResponseDto
            {
                Success = false,
                Message = "Error al enviar el email de verificación",
                Data = new { email = user.Email, sent = false }
            };
        }
    }

    public async Task<EmailResponseDto> ForgotPasswordAsync(ForgotPasswordDto forgotPasswordDto)
    {
        var user = await userRepository.GetByEmailAsync(forgotPasswordDto.Email);
        if (user == null)
        {
            // Por seguridad, siempre devolvemos éxito aunque el usuario no exista
            return new EmailResponseDto
            {
                Success = true,
                Message = "Si el email existe, se ha enviado un enlace de recuperación",
                Data = new { email = forgotPasswordDto.Email, initiated = true }
            };
        }

        // Generar token de reset
        var resetToken = TokenGeneratorService.GeneratePasswordResetToken();

        if (user.UserPasswordReset == null)
        {
            user.UserPasswordReset = new UserPasswordReset
            {
                UserId = user.Id,
                PasswordResetToken = resetToken,
                PasswordResetTokenExpiry = DateTime.UtcNow.AddHours(1)
            };
        }
        else
        {
            user.UserPasswordReset.PasswordResetToken = resetToken;
            user.UserPasswordReset.PasswordResetTokenExpiry = DateTime.UtcNow.AddHours(1); // 1 hora para resetear
        }

        await userRepository.UpdateAsync(user);

        // Enviar email
        try
        {
            await emailService.SendPasswordResetAsync(user.Email, user.Username, resetToken);
            logger.LogInformation("Password reset email sent to {Email}", user.Email);
        }
        catch (Exception ex)
        {
            logger.LogError(ex, "Failed to send password reset email to {Email}", user.Email);
        }

        return new EmailResponseDto
        {
            Success = true,
            Message = "Si el email existe, se ha enviado un enlace de recuperación",
            Data = new { email = forgotPasswordDto.Email, initiated = true }
        };
    }

    public async Task<EmailResponseDto> ResetPasswordAsync(ResetPasswordDto resetPasswordDto)
    {
        var user = await userRepository.GetByPasswordResetTokenAsync(resetPasswordDto.Token);
        if (user == null || user.UserPasswordReset == null)
        {
            return new EmailResponseDto
            {
                Success = false,
                Message = "Token de reset inválido o expirado",
                Data = new { token = resetPasswordDto.Token, reset = false }
            };
        }

        // Actualizar contraseña
        user.Password = passwordHashService.HashPassword(resetPasswordDto.NewPassword);
        user.UserPasswordReset.PasswordResetToken = null;
        user.UserPasswordReset.PasswordResetTokenExpiry = null;

        await userRepository.UpdateAsync(user);

        logger.LogInformation("Password reset successfully for user {Username}", user.Username);

        return new EmailResponseDto
        {
            Success = true,
            Message = "Contraseña actualizada exitosamente",
            Data = new { email = user.Email, reset = true }
        };
    }

    public async Task<UserResponseDto?> GetUserByIdAsync(string userId)
    {
        var user = await userRepository.GetByIdAsync(userId);
        if (user == null)
        {
            return null;
        }

        return MapToUserResponseDto(user);
    }

    public Task RegisterLoginHistoryAsync(string userId, string ipAddress)
    {
        logger.LogInformation("Login history requested for user {UserId} from IP {IpAddress}", userId, ipAddress);
        return Task.CompletedTask;
    }

    public Task<IEnumerable<LoginHistory>> GetLoginHistoryAsync(string userId)
    {
        logger.LogInformation("Login history requested for user {UserId}", userId);
        return Task.FromResult(Enumerable.Empty<LoginHistory>());
    }

}

