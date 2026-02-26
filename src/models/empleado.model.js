import mongoose, { Schema } from "mongoose";
import bcrypt from "bcryptjs";

const empleadoSchema = new Schema({
    empleado_name: {
        type: String,
        required: [true, 'El nombre del empleado es obligatorio'],
        trim: true
    },
    empleado_surname: {
        type: String,
        required: [true, 'El apellido del empleado es obligatorio'],
        trim: true
    },
    empleado_email: {
        type: String,
        required: [true, 'El email es obligatorio'],
        unique: true,
        lowercase: true,
        trim: true
    },
    empleado_password: {
        type: String,
        required: [true, 'La contraseña es obligatoria'],
        minlength: 8
    },
    empleado_dpi: {
        type: String,
        required: [true, 'El DPI es obligatorio'],
        unique: true,
        match: [/^\d{13}$/, 'El DPI debe tener 13 dígitos'],
        immutable: true
    },
    empleado_age: {
        type: Number,
        required: [true, 'La edad es obligatoria'],
        min: [18, 'La edad mínima es 18 años'],
        max: [70, 'La edad máxima es 70 años']
    },
    empleado_antique: {
        type: Number,
        default: 0,
        min: [0, 'La antigüedad no puede ser negativa']
    },
    empleado_salary: {
        type: Number,
        required: [true, 'El salario es obligatorio'],
        min: [0, 'El salario no puede ser negativo']
    },
    empleado_post: {
        type: String,
        required: [true, 'El puesto es obligatorio'],
        enum: {
            values: ['CAJERO', 'ASESOR', 'GERENTE', 'SUPERVISOR', 'ANALISTA'],
            message: 'Puesto no válido'
        }
    },
    empleado_type: {
        type: String,
        default: 'EMPLEADO',
        enum: ['EMPLEADO']
    },
    empleado_state: {
        type: Boolean,
        default: false  // Requiere aprobación del admin
    }
}, {
    timestamps: true,
    versionKey: false
});

// Prevenir modificación de DPI
empleadoSchema.pre('findOneAndUpdate', function() {
    const update = this.getUpdate();
    if (update.empleado_dpi || (update.$set && update.$set.empleado_dpi)) {
        throw new Error('El DPI no puede ser modificado');
    }
});

// Hash de password antes de guardar
empleadoSchema.pre("save", async function () {
    if (!this.isModified("empleado_password")) return;
    const salt = await bcrypt.genSalt(10);
    this.empleado_password = await bcrypt.hash(this.empleado_password, salt);
});

// Método para comparar passwords
empleadoSchema.methods.comparePassword = async function (password) {
    return await bcrypt.compare(password, this.empleado_password);
};

// Método para ocultar password en JSON
empleadoSchema.methods.toJSON = function () {
    const { empleado_password, __v, ...empleado } = this.toObject();
    return empleado;
};

// Índices para búsquedas rápidas
empleadoSchema.index({ empleado_email: 1 });
empleadoSchema.index({ empleado_dpi: 1 });
empleadoSchema.index({ empleado_state: 1 });

// Guard para evitar OverwriteModelError
const Empleado = mongoose.models.Empleado || mongoose.model("Empleado", empleadoSchema);

export default Empleado;