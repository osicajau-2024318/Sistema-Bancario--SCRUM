using FluentValidation;
using AuthServiceBanco.Application.DTOs.Admin;

namespace AuthServiceBanco.Application.Validators;

public class CreateClientDtoValidator : AbstractValidator<CreateClientDto>
{
    public CreateClientDtoValidator()
    {
        RuleFor(x => x.Name)
            .NotEmpty().WithMessage("El nombre es requerido")
            .MaximumLength(100).WithMessage("El nombre no puede exceder 100 caracteres");

        RuleFor(x => x.Surname)
            .NotEmpty().WithMessage("El apellido es requerido")
            .MaximumLength(100).WithMessage("El apellido no puede exceder 100 caracteres");

        RuleFor(x => x.Username)
            .NotEmpty().WithMessage("El nombre de usuario es requerido")
            .MinimumLength(4).WithMessage("El nombre de usuario debe tener al menos 4 caracteres")
            .MaximumLength(50).WithMessage("El nombre de usuario no puede exceder 50 caracteres");

        RuleFor(x => x.Dpi)
            .NotEmpty().WithMessage("El DPI es requerido")
            .Length(13).WithMessage("El DPI debe tener exactamente 13 dígitos")
            .Matches(@"^\d{13}$").WithMessage("El DPI solo debe contener números");

        RuleFor(x => x.Address)
            .NotEmpty().WithMessage("La dirección es requerida")
            .MaximumLength(200).WithMessage("La dirección no puede exceder 200 caracteres");

        RuleFor(x => x.Phone)
            .NotEmpty().WithMessage("El teléfono es requerido")
            .Matches(@"^\d{8}$").WithMessage("El teléfono debe tener 8 dígitos");

        RuleFor(x => x.Email)
    .NotEmpty().WithMessage("El email es requerido")
    .EmailAddress(FluentValidation.Validators.EmailValidationMode.AspNetCoreCompatible)
    .WithMessage("El formato del email no es válido")
    .MaximumLength(100).WithMessage("El email no puede exceder 100 caracteres");

        RuleFor(x => x.Password)
            .NotEmpty().WithMessage("La contraseña es requerida")
            .MinimumLength(6).WithMessage("La contraseña debe tener al menos 6 caracteres")
            .MaximumLength(100).WithMessage("La contraseña no puede exceder 100 caracteres");

        RuleFor(x => x.WorkName)
            .NotEmpty().WithMessage("El lugar de trabajo es requerido")
            .MaximumLength(100).WithMessage("El lugar de trabajo no puede exceder 100 caracteres");

        RuleFor(x => x.MonthlyIncome)
            .GreaterThanOrEqualTo(100).WithMessage("Los ingresos mensuales deben ser al menos Q100")
            .LessThanOrEqualTo(1000000).WithMessage("Los ingresos mensuales no pueden exceder Q1,000,000");
    }
}
