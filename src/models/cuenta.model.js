import { Schema, model } from "mongoose";

const cuentaSchema = new Schema({
    numeroCuenta: {
        type: String,
        required: [true, 'El número de cuenta es obligatorio'],
        unique: true,
        match: [/^\d{10}$/, 'El número de cuenta debe tener 10 dígitos']
    },
    userId: {
        type: Schema.Types.ObjectId,
        ref: 'User',
        required: [true, 'El usuario es obligatorio']
    },
    tipoCuenta: {
        type: String,
        required: [true, 'El tipo de cuenta es obligatorio'],
        enum: {
            values: ['AHORRO', 'CORRIENTE', 'NOMINA'],
            message: 'Tipo de cuenta no válido'
        },
        default: 'AHORRO'
    },
    saldo: {
        type: Number,
        required: [true, 'El saldo inicial es obligatorio'],
        min: [0, 'El saldo no puede ser negativo']
    },
    moneda: {
        type: String,
        required: [true, 'La moneda es obligatoria'],
        enum: {
            values: ['GTQ', 'USD'],
            message: 'Moneda no válida. Use GTQ o USD'
        }
    },
    // Estado para el sistema de aprobación (similar a User)
    aprobada: {
        type: Boolean,
        default: false  // Las cuentas creadas por clientes requieren aprobación
    },
    // Estado operacional de la cuenta
    estado: {
        type: String,
        enum: {
            values: ['ACTIVA', 'BLOQUEADA', 'CERRADA'],
            message: 'Estado no válido'
        },
        default: 'ACTIVA'
    },
    fechaApertura: {
        type: Date,
        default: Date.now
    }
}, {
    timestamps: true,
    versionKey: false
});

// Índices para búsquedas rápidas
cuentaSchema.index({ userId: 1 });
cuentaSchema.index({ numeroCuenta: 1 });
cuentaSchema.index({ estado: 1 });
cuentaSchema.index({ aprobada: 1 });

export default model('Cuenta', cuentaSchema);