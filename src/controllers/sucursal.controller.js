import Sucursal from "../models/sucursal.model.js";

export const createSucursal = async (req, res) => {
    try {
        const sucursal = new Sucursal(req.body);
        await sucursal.save();

        res.status(201).json({
            success: true,
            message: "Sucursal creada",
            sucursal
        })
    } catch (error) {
        res.status(500).json({
            success: false,
            message: "Error al crear la sucursal",
            error: error.message
        });
    }
};

export const getSucursales = async (req, res) => {
    try {
        const sucursales = await Sucursal.find();
        res.status(200).json({
            success: true,
            sucursales
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: "Error al obtener las sucursales",
            error: error.message
        });
    }
};

export const updateSucursal = async (req, res) => {
    try {
        const {id} = req.params;

        const sucursal = await Sucursal.findByIdAndUpdate(
            id,
            req.body,
            {new: true}
        );

        res.status(200).json({
            success: true,
            message: "Sucursal actualizada",
            sucursal
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: "Error al actualizar la sucursal",
            error: error.message
        });
    }
};

export const deleteSucursal = async (req, res) => {
    try {
        const {id} = req.params;
        const sucursal = await Sucursal.findByIdAndDelete(id);

        if (!sucursal) {
            return res.status(404).json({
                success: false,
                message: "Sucursal no encontrada"
            });
        }

        res.status(200).json({
            success: true,
            message: "Sucursal eliminada",
            sucursal
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: "Error al eliminar la sucursal",
            error: error.message
        });
    }
};
