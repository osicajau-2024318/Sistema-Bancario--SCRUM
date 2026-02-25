import {Schema, model} from "mongoose";

const sucursalSchema = new Schema({
    nombre: {
        type: String,
        required: true  
    },

    direccion: {
        type: String,
        required: true
    },

    telefono: {
        type: String,
        required: true  
    },

    horario: {
        type: String,
        required: true
    }
}, {
    timestamps: true
});

export default model("Sucursal", sucursalSchema);