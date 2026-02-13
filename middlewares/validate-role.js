import User from "./user.model.js";

export const getUsers = async (req, res) => {
    try {
        const users = await User.find({ isActive: true });

        res.status(200).json({
            success: true,
            users
        });

    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message
        });
    }
};

export const updateUser = async (req, res) => {
    try {
        const { id } = req.params;
        const data = req.body;

        const user = await User.findByIdAndUpdate(
            id,
            data,
            { new: true }
        );

        if (!user) {
            return res.status(404).json({
                success: false,
                message: "Error, usuario no encontrado"
            });
        }

        res.status(200).json({
            success: true,
            message: "Usuario actualizado correctamente",
            user
        });

    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message
        });
    }
};

export const deleteUser = async (req, res) => {
    try {
        const { id } = req.params;

        const user = await User.findByIdAndUpdate(
            id,
            { isActive: false },
            { new: true }
        );

        if (!user) {
            return res.status(404).json({
                success: false,
                message: "Usuario no encontrado"
            });
        }

        res.status(200).json({
            success: true,
            message: "Usuario eliminado",
            user
        });

    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message
        });
    }
};
