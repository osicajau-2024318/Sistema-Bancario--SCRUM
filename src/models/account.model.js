import { Schema, model } from "mongoose";

const accountSchema = new Schema({

    account_id: {
        type: String,
        required: [true, 'El número de cuenta es obligatorio'],
        unique: true,
        match: [/^\d{10}$/, 'El número de cuenta debe tener 10 dígitos']
    },

    account_number : {
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
        default: 0,
        min: [0, 'El saldo no puede ser menor a 0']
    },
    account_history: {
        type: String,
        default: 'GTQ',
        enum: ['GTQ', 'USD']
    },
    account_status: {
        type: String,
        enum: {
            values: ['ACTIVA', 'BLOQUEADA', 'CERRADA'],
            message: 'Estado no válido'
        },
        default: 'ACTIVA'
    },
    account_bill: {
        type: Date,
        default: Date.now
    }
        
}, {
    timestamps: true,
    versionKey: false
});


accountSchema.index({ userId: 1 });
accountSchema.index({ account_number: 1 });
accountSchema.index({ account_status: 1 });

export default model('Cuenta', accountSchema);