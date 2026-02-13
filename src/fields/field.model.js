'use strict';

import mongoose from "mongoose";

const { Schema, Types } = mongoose;

const bankAccountSchema = new Schema(
    {
        accountNumber: {
            type: String,
            required: [true, 'El número de cuenta es requerido'],
            unique: true,
            trim: true,
            maxlength: [30, 'El número de cuenta no puede exceder 30 caracteres']
        },
        accountType: {
            type: String,
            required: [true, 'El tipo de cuenta es requerido'],
            enum: {
                values: ['AHORRO', 'MONETARIA'],
                message: 'Tipo de cuenta no válido'
            }
        },
        holderName: {
            type: String,
            required: [true, 'El nombre del titular es requerido'],
            trim: true,
            maxlength: [200, 'El nombre no puede exceder 200 caracteres']
        },
        holderId: {
            type: Types.ObjectId,
            ref: 'User',
            required: [true, 'El identificador del titular es requerido']
        },
        branchId: {
            type: Types.ObjectId,
            ref: 'Branch'
        },
        currency: {
            type: String,
            required: true,
            default: 'USD',
            maxlength: [5, 'Código de moneda inválido']
        },
        balance: {
            type: Number,
            required: true,
            default: 0
        },
        status: {
            type: String,
            enum: {
                values: ['ACTIVO', 'SUSPENDIDO', 'CERRADO'],
                message: 'Estado de cuenta inválido'
            },
            default: 'ACTIVO'
        },
        isActive: {
            type: Boolean,
            default: true
        },
        metadata: {
            type: Schema.Types.Mixed,
            default: {}
        }
    },
    {
        timestamps: true,
        versionKey: false
    }
);

bankAccountSchema.index({ accountNumber: 1 }, { unique: true });
bankAccountSchema.index({ holderId: 1 });
bankAccountSchema.index({ branchId: 1 });
bankAccountSchema.index({ isActive: 1, status: 1 });

export default mongoose.model('BankAccount', bankAccountSchema);