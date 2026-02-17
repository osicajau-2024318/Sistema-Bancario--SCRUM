import Retiro from "../models/retiro.model.js";

export const createRetiro = async (req, res) => {
    try {
        const { monto, descripcion, cuenta } = req.body;

        const retiro = new Retiro({
            monto,
            descripcion,
            cuenta,
            usuario: req.user.id
        });

        await retiro.save();

        res.status(201).json({
            success: true,
            message: "Retiro realizado correctamente",
            retiro
        });

    } catch (error) {
        res.status(500).json({
            success: false,
            message: "Error al realizar el retiro",
            error: error.message
        });
    }
};

export const getRetiros = async (req, res) => {
    try {
        const retiros = await Retiro.find({ estado: true })
            .populate("usuario", "nombre email")
            .populate("cuenta");

        res.status(200).json({
            success: true,
            retiros
        });

    } catch (error) {
        res.status(500).json({
            success: false,
            message: "Error al obtener los retiros",
            error: error.message
        });
    }
};

export const getRetiroById = async (req, res) => {
    try {
        const { id } = req.params;

        const retiro = await Retiro.findById(id)
            .populate("usuario", "nombre email")
            .populate("cuenta");

        if (!retiro || !retiro.estado) {
            return res.status(404).json({
                success: false,
                message: "Retiro no encontrado"
            });
        }

        res.status(200).json({
            success: true,
            retiro
        });

    } catch (error) {
        res.status(500).json({
            success: false,
            message: "Error al obtener el retiro",
            error: error.message
        });
    }
};

export const updateRetiro = async (req, res) => {
    try {
        const { id } = req.params;

        const retiro = await Retiro.findByIdAndUpdate(
            id,
            req.body,
            { new: true }
        );

        if (!retiro) {
            return res.status(404).json({
                success: false,
                message: "Retiro no encontrado"
            });
        }

        res.status(200).json({
            success: true,
            message: "Retiro actualizado correctamente",
            retiro
        });

    } catch (error) {
        res.status(500).json({
            success: false,
            message: "Error al actualizar el retiro",
            error: error.message
        });
    }
};

export const deleteRetiro = async (req, res) => {
    try {
        const { id } = req.params;

        const retiro = await Retiro.findByIdAndUpdate(
            id,
            { estado: false },
            { new: true }
        );

        if (!retiro) {
            return res.status(404).json({
                success: false,
                message: "Retiro no encontrado"
            });
        }

        res.status(200).json({
            success: true,
            message: "Retiro eliminado correctamente",
            retiro
        });

    } catch (error) {
        res.status(500).json({
            success: false,
            message: "Error al eliminar el retiro",
            error: error.message
        });
    }
};
