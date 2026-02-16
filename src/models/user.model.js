import { Schema, model } from "mongoose";
import bcrypt from "bcryptjs";

export const ROLES = {
    ADMIN: "ADMIN",
    CLIENTE: "CLIENTE"
};

const userSchema = new Schema({
    numeroCuenta: {
        type: String,
        required: true,
        unique: true
    },
    name: {
        type: String,
        required: true
    },
    username: {
        type: String,
        required: [true, 'El username es obligatorio'],
        unique: true,
        trim: true
    },
    dpi: {
        type: String,
        required: true,
        unique: true,
        immutable: true
    },
    email: {
        type: String,
        required: true,
        unique: true,
        lowercase: true
    },
    password: {
        type: String,
        required: true,
        minlength: 6
    },
    address: {
        type: String,
        required: [true, 'La dirección es obligatoria'],
        trim: true
    },
    cellphone: {
        type: String,
        required: [true, 'El celular es obligatorio'],
        match: [/^\d{8}$/, 'El celular debe tener 8 dígitos']
    },
    workPlace: {
        type: String,
        required: [true, 'El nombre de trabajo es obligatorio'],
        trim: true
    },
    monthlyIncome: {
        type: Number,
        required: [true, 'Los ingresos mensuales son obligatorios'],
        min: [100, 'Los ingresos deben ser al menos Q100']
    },
    balance: {
        type: Number,
        default: 0,
        min: [0, 'El saldo no puede ser negativo']
    },
    rol: {
        type: String,
        enum: Object.values(ROLES),
        default: ROLES.CLIENTE
    },
    estado: {
        type: Boolean,
        default: true
    }
}, {
    timestamps: true
});

userSchema.pre('findOneAndUpdate', function(next) {
    const update = this.getUpdate();
    if (update.dpi || (update.$set && update.$set.dpi)) {
        return next(new Error('El DPI no puede ser modificado'));
    }
    next();
});

userSchema.pre("save", async function () {
    if (!this.isModified("password")) return;
    const salt = await bcrypt.genSalt(10);
    this.password = await bcrypt.hash(this.password, salt);
});

userSchema.methods.comparePassword = async function (password) {
    return await bcrypt.compare(password, this.password);
};

userSchema.methods.toJSON = function () {
    const { password, __v, ...user } = this.toObject();
    return user;
};

export default model("User", userSchema);