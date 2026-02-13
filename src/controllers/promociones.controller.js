import Promocion from "./promocion.model.js";

export const createPromocion = async (req, res) => {
    try {

        const promocion = new Promocion(req.body);
        await promocion.save();

        res.status(201).json({
            success: true,
            message: "Promoción creada",
            promocion
        });

    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message
        });
    }
};

export const getPromociones = async (req, res) => {
    try {

        const promociones = await Promocion.find();

        res.status(200).json({
            success: true,
            promociones
        });

    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message
        });
    }
};

export const updatePromocion = async (req, res) => {
    try {

        const { id } = req.params;

        const promocion = await Promocion.findByIdAndUpdate(
            id,
            req.body,
            { new: true }
        );

        if (!promocion) {
            return res.status(404).json({
                success: false,
                message: "Promoción no encontrada"
            });
        }

        res.status(200).json({
            success: true,
            message: "Promoción actualizada",
            promocion
        });

    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message
        });
    }
};

export const deletePromocion = async (req, res) => {
    try {

        const { id } = req.params;

        const promocion = await Promocion.findByIdAndDelete(id);

        if (!promocion) {
            return res.status(404).json({
                success: false,
                message: "Promoción no encontrada"
            });
        }

        res.status(200).json({
            success: true,
            message: "Promoción eliminada"
        });

    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message
        });
    }
};
