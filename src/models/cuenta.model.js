import mongoose, { Schema } from "mongoose";

const cuentaSchema = new Schema({
    account_number: {
        type: String,
        required: [true, 'El número de cuenta es obligatorio'],
        unique: true,
        match: [/^\d{10}$/, 'El número de cuenta debe tener 10 dígitos']
    },
    user_id: {
        type: Schema.Types.ObjectId,
        ref: 'User',
        required: [true, 'El usuario es obligatorio']
    },
    account_type: {
        type: String,
        required: [true, 'El tipo de cuenta es obligatorio'],
        enum: {
            values: ['AHORRO', 'CORRIENTE', 'NOMINA'],
            message: 'Tipo de cuenta no válido'
        },
        default: 'AHORRO'
    },
    account_balance: {
        type: Number,
        required: [true, 'El saldo inicial es obligatorio'],
        min: [0, 'El saldo no puede ser negativo']
    },
    account_history: [{
        type: Schema.Types.ObjectId,
        ref: 'Transaccion'
    }],
    moneda: {
        type: String,
        required: [true, 'La moneda es obligatoria'],
        enum: {
            values: ['GTQ', 'USD'],
            message: 'Moneda no válida. Use GTQ o USD'
        }
    },
    aprobada: {
        type: Boolean,
        default: false
    },
    estado: {
        type: String,
        enum: {
            values: ['ACTIVA', 'BLOQUEADA', 'CERRADA', 'PENDIENTE'],
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


cuentaSchema.index({ user_id: 1 });
cuentaSchema.index({ estado: 1 });
cuentaSchema.index({ aprobada: 1 });


const Cuenta = mongoose.models.Cuenta || mongoose.model('Cuenta', cuentaSchema);

export default Cuenta;