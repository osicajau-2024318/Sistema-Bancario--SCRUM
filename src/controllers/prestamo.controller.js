import Prestamo from "../models/prestamo.model.js";

export const createPrestamo = async (req, res) => {
    try {
        const { monto, interes, plazo, cuenta } = req.body;

        const prestamo = new Prestamo({
            monto,
            interes,
            plazo,
            cuenta,            // referencia a Cuenta
            usuario: req.user.id, // viene del token
        });

        await prestamo.save();

        res.status(201).json({
            success: true,
            message: "Préstamo creado correctamente",
            prestamo
        });

    } catch (error) {
        res.status(500).json({
            success: false,
            message: "Error al crear el préstamo",
            error: error.message
        });
    }
};

export const getPrestamos = async (req, res) => {
    try {
        const prestamos = await Prestamo.find({ estado: true })
            .populate("usuario", "nombre email")
            .populate("cuenta", "numeroCuenta tipo");

        res.status(200).json({
            success: true,
            prestamos
        });

    } catch (error) {
        res.status(500).json({
            success: false,
            message: "Error al obtener los préstamos",
            error: error.message
        });
    }
};

export const getPrestamoById = async (req, res) => {
    try {
        const { id } = req.params;

        const prestamo = await Prestamo.findById(id)
            .populate("usuario", "nombre email")
            .populate("cuenta", "numeroCuenta tipo");

        if (!prestamo) {
            return res.status(404).json({
                success: false,
                message: "Préstamo no encontrado"
            });
        }

        res.status(200).json({
            success: true,
            prestamo
        });

    } catch (error) {
        res.status(500).json({
            success: false,
            message: "Error al obtener el préstamo",
            error: error.message
        });
    }
};

export const updatePrestamo = async (req, res) => {
    try {
        const { id } = req.params;

        const prestamo = await Prestamo.findByIdAndUpdate(
            id,
            req.body,
            { new: true }
        );

        if (!prestamo) {
            return res.status(404).json({
                success: false,
                message: "Préstamo no encontrado"
            });
        }

        res.status(200).json({
            success: true,
            message: "Préstamo actualizado correctamente",
            prestamo
        });

    } catch (error) {
        res.status(500).json({
            success: false,
            message: "Error al actualizar el préstamo",
            error: error.message
        });
    }
};

export const deletePrestamo = async (req, res) => {
    try {
        const { id } = req.params;

        const prestamo = await Prestamo.findByIdAndUpdate(
            id,
            { estado: false },
            { new: true }
        );

        if (!prestamo) {
            return res.status(404).json({
                success: false,
                message: "Préstamo no encontrado"
            });
        }

        res.status(200).json({
            success: true,
            message: "Préstamo eliminado",
            prestamo
        });

    } catch (error) {
        res.status(500).json({
            success: false,
            message: "Error al eliminar el préstamo",
            error: error.message
        });
    }
};
