import mongoose, { Schema } from "mongoose";
import bcrypt from "bcryptjs";

const userSchema = new Schema({
    user_number_account: {
        type: String,
        required: true,
        unique: true
    },
    user_name: {
        type: String,
        required: true
    },
    user_username: {
        type: String,
        required: [true, 'El username es obligatorio'],
        unique: true,
        trim: true
    },
    user_dpi: {
        type: String,
        required: true,
        unique: true,
        immutable: true
    },
    user_email: {
        type: String,
        required: true,
        unique: true,
        lowercase: true
    },
    user_password: {
        type: String,
        required: true,
        minlength: 6
    },
    user_address: {
        type: String,
        required: [true, 'La dirección es obligatoria'],
        trim: true
    },
    user_phone_number: {
        type: String,
        required: [true, 'El celular es obligatorio'],
        match: [/^\d{8}$/, 'El celular debe tener 8 dígitos']
    },
    user_name_work: {
        type: String,
        required: [true, 'El nombre de trabajo es obligatorio'],
        trim: true
    },
    user_income_month: {
        type: Number,
        required: [true, 'Los ingresos mensuales son obligatorios'],
        min: [100, 'Los ingresos deben ser al menos Q100']
    },
    balance: {
        type: Number,
        default: 0,
        min: [0, 'El saldo no puede ser negativo']
    },
    user_type: {
        type: String,
        enum: ["ADMIN", "CLIENTE"],
        default: "CLIENTE"
    },
    estado: {
        type: Boolean,
        default: false // Cuando se crea un usuario se crea como falso y no se registra
    }
}, {
    timestamps: true
});

// Prevenir modificación de DPI
userSchema.pre('findOneAndUpdate', function() {
    const update = this.getUpdate();
    if (update.user_dpi || (update.$set && update.$set.user_dpi)) {
        throw new Error('El DPI no puede ser modificado');
    }
});

userSchema.pre("save", async function () {
    if (!this.isModified("user_password")) return;
    const salt = await bcrypt.genSalt(10);
    this.user_password = await bcrypt.hash(this.user_password, salt);
});

userSchema.methods.comparePassword = async function (password) {
    return await bcrypt.compare(password, this.user_password);
};

userSchema.methods.toJSON = function () {
    const { user_password, __v, ...user } = this.toObject();
    return user;
};

// Guard para evitar OverwriteModelError si el módulo se carga más de una vez
const User = mongoose.models.User || mongoose.model("User", userSchema);

export default User;