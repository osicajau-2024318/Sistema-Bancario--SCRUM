import Transaccion from "../models/transaccion.model.js";
import Cuenta from "../models/cuenta.model.js";

export const createTransaccion = async (req, res) => {
    try {
        const { tipo, monto, descripcion, cuentaOrigen, cuentaDestino } = req.body;
        const usuarioId = req.user.id;

        const cuenta = await Cuenta.findById(cuentaOrigen);

        if (!cuenta) {
            return res.status(404).json({
                success: false,
                message: "Cuenta origen no encontrada"
            });
        }

        if (!cuenta.usuario.equals(usuarioId)) {
            return res.status(403).json({
                success: false,
                message: "No puedes operar con esta cuenta"
            });
        }

        if (tipo === "RETIRO" || tipo === "TRANSFERENCIA") {
            if (cuenta.saldo < monto) {
                return res.status(400).json({
                    success: false,
                    message: "Saldo insuficiente"
                });
            }
        }

        if (tipo === "TRANSFERENCIA") {
            if (!cuentaDestino) {
                return res.status(400).json({
                    success: false,
                    message: "Cuenta destino requerida"
                });
            }
        }

        if (tipo === "DEPOSITO") {
            cuenta.saldo += monto;
        }

        if (tipo === "RETIRO") {
            cuenta.saldo -= monto;
        }

        let cuentaDestinoDoc = null;

        if (tipo === "TRANSFERENCIA") {
            cuenta.saldo -= monto;

            cuentaDestinoDoc = await Cuenta.findById(cuentaDestino);

            if (!cuentaDestinoDoc) {
                return res.status(404).json({
                    success: false,
                    message: "Cuenta destino no encontrada"
                });
            }

            cuentaDestinoDoc.saldo += monto;
            await cuentaDestinoDoc.save();
        }

        await cuenta.save();

        const transaccion = new Transaccion({
            tipo,
            monto,
            descripcion,
            usuario: usuarioId,
            cuentaOrigen,
            cuentaDestino: cuentaDestinoDoc?._id || null
        });

        await transaccion.save();

        res.status(201).json({
            success: true,
            message: "Transacción realizada correctamente",
            transaccion
        });

    } catch (error) {
        res.status(500).json({
            success: false,
            message: "Error al realizar la transacción",
            error: error.message
        });
    }
};

export const getTransacciones = async (req, res) => {
    try {
        const transacciones = await Transaccion.find({ estado: true })
            .populate("usuario", "nombre email")
            .populate("cuentaOrigen", "numeroCuenta saldo")
            .populate("cuentaDestino", "numeroCuenta saldo");

        res.status(200).json({
            success: true,
            transacciones
        });

    } catch (error) {
        res.status(500).json({
            success: false,
            message: "Error al obtener las transacciones",
            error: error.message
        });
    }
};

export const getTransaccionById = async (req, res) => {
    try {
        const { id } = req.params;

        const transaccion = await Transaccion.findById(id)
            .populate("usuario", "nombre email")
            .populate("cuentaOrigen", "numeroCuenta saldo")
            .populate("cuentaDestino", "numeroCuenta saldo");

        if (!transaccion) {
            return res.status(404).json({
                success: false,
                message: "Transacción no encontrada"
            });
        }

        res.status(200).json({
            success: true,
            transaccion
        });

    } catch (error) {
        res.status(500).json({
            success: false,
            message: "Error al obtener la transacción",
            error: error.message
        });
    }
};

export const deleteTransaccion = async (req, res) => {
    try {
        const { id } = req.params;

        const transaccion = await Transaccion.findByIdAndUpdate(
            id,
            { estado: false },
            { new: true }
        );

        if (!transaccion) {
            return res.status(404).json({
                success: false,
                message: "Transacción no encontrada"
            });
        }

        res.status(200).json({
            success: true,
            message: "Transacción eliminada",
            transaccion
        });

    } catch (error) {
        res.status(500).json({
            success: false,
            message: "Error al eliminar la transacción",
            error: error.message
        });
    }
};
