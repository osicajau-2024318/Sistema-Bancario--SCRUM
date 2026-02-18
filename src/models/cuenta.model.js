import { Schema, model } from "mongoose";

// Modelos  para las cuentas bancarias 
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
        default: 0,
        min: [0, 'El saldo no puede ser menor a 0']
    },
    moneda: {
        type: String,
        default: 'GTQ',
        enum: ['GTQ', 'USD']
    },
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

// Indice para buscar mas rapido por Id Usuario Numero de ceunta y estado.
cuentaSchema.index({ userId: 1 });
cuentaSchema.index({ numeroCuenta: 1 });
cuentaSchema.index({ estado: 1 });

export default model('Cuenta', cuentaSchema);