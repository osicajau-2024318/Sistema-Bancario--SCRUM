import {Schema, model} from "mongoose";

const promocionSchema = new Schema({
    titulo: {
        type: String,
        required: true
    },

    descripcion: {
        type: String,
        required: true
    },

    fecha_inicio: {
        type: Date,
        required: true
    },

    fecha_fin: {
        type: Date,
        required: true
    },

    estado: {
        type: Boolean,
        default: true
    }
}, {
    timestamps: true
});

export default model("Promocion", promocionSchema);