using FluentValidation;
using AuthServiceBanco.Application.DTOs.Admin;

namespace AuthServiceBanco.Application.Validators;

public class UpdateUserDtoValidator : AbstractValidator<UpdateUserDto>
{
    public UpdateUserDtoValidator()
    {
        When(x => x.Name != null, () =>
        {
            RuleFor(x => x.Name)
                .NotEmpty().WithMessage("El nombre no puede estar vacío")
                .MaximumLength(25).WithMessage("El nombre no puede exceder 25 caracteres");
        });

        When(x => x.Surname != null, () =>
        {
            RuleFor(x => x.Surname)
                .NotEmpty().WithMessage("El apellido no puede estar vacío")
                .MaximumLength(25).WithMessage("El apellido no puede exceder 25 caracteres");
        });

        When(x => x.Address != null, () =>
        {
            RuleFor(x => x.Address)
                .NotEmpty().WithMessage("La dirección no puede estar vacía")
                .MaximumLength(100).WithMessage("La dirección no puede exceder 100 caracteres");
        });

        When(x => x.Phone != null, () =>
        {
            RuleFor(x => x.Phone)
                .NotEmpty().WithMessage("El teléfono no puede estar vacío")
                .Matches(@"^\d{8}$").WithMessage("El teléfono debe tener exactamente 8 dígitos");
        });

        When(x => x.WorkName != null, () =>
        {
            RuleFor(x => x.WorkName)
                .NotEmpty().WithMessage("El lugar de trabajo no puede estar vacío")
                .MaximumLength(50).WithMessage("El lugar de trabajo no puede exceder 50 caracteres");
        });

        When(x => x.MonthlyIncome.HasValue, () =>
        {
            RuleFor(x => x.MonthlyIncome!.Value)
                .GreaterThanOrEqualTo(100).WithMessage("Los ingresos mensuales deben ser al menos Q100")
                .LessThanOrEqualTo(1000000).WithMessage("Los ingresos mensuales no pueden exceder Q1,000,000");
        });
    }
}
