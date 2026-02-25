import Cuenta from "../models/cuenta.model.js";

export const createCuenta = async (req, res) => {
    try {
        const { numeroCuenta, tipo, saldo } = req.body;

        const cuenta = new Cuenta({
            numeroCuenta,
            tipo,
            saldo,
            usuario: req.user.id // viene del token
        });

        await cuenta.save();

        res.status(201).json({
            success: true,
            message: "Cuenta creada correctamente",
            cuenta
        });

    } catch (error) {
        res.status(500).json({
            success: false,
            message: "Error al crear la cuenta",
            error: error.message
        });
    }
};

export const getCuentas = async (req, res) => {
    try {
        const cuentas = await Cuenta.find({ estado: true })
            .populate("usuario", "nombre email");

        res.status(200).json({
            success: true,
            cuentas
        });

    } catch (error) {
        res.status(500).json({
            success: false,
            message: "Error al obtener las cuentas",
            error: error.message
        });
    }
};

export const getCuentaById = async (req, res) => {
    try {
        const { id } = req.params;

        const cuenta = await Cuenta.findById(id)
            .populate("usuario", "nombre email");

        if (!cuenta) {
            return res.status(404).json({
                success: false,
                message: "Cuenta no encontrada"
            });
        }

        res.status(200).json({
            success: true,
            cuenta
        });

    } catch (error) {
        res.status(500).json({
            success: false,
            message: "Error al obtener la cuenta",
            error: error.message
        });
    }
};

export const updateCuenta = async (req, res) => {
    try {
        const { id } = req.params;

        const cuenta = await Cuenta.findByIdAndUpdate(
            id,
            req.body,
            { new: true }
        );

        if (!cuenta) {
            return res.status(404).json({
                success: false,
                message: "Cuenta no encontrada"
            });
        }

        res.status(200).json({
            success: true,
            message: "Cuenta actualizada correctamente",
            cuenta
        });

    } catch (error) {
        res.status(500).json({
            success: false,
            message: "Error al actualizar la cuenta",
            error: error.message
        });
    }
};

export const deleteCuenta = async (req, res) => {
    try {
        const { id } = req.params;

        const cuenta = await Cuenta.findByIdAndUpdate(
            id,
            { estado: false },
            { new: true }
        );

        if (!cuenta) {
            return res.status(404).json({
                success: false,
                message: "Cuenta no encontrada"
            });
        }

        res.status(200).json({
            success: true,
            message: "Cuenta eliminada",
            cuenta
        });

    } catch (error) {
        res.status(500).json({
            success: false,
            message: "Error al eliminar la cuenta",
            error: error.message
        });
    }
};
