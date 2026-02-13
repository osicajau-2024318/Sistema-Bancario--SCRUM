import User from "./user.model.js";

export const registerUser = async (req, res) => {
    try {
        const user = new User(req.body);
        await user.save();

        res.status(201).json({
            success: true,
            message: "Usuario registrado con exito",
            user
        });

    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message
        });
    }
};


export const loginUser = async (req, res) => {
    try {

        const { email, password } = req.body;

        const user = await User.findOne({ email });

        if (!user) {
            return res.status(400).json({
                message: "Usuario no encontrado"
            });
        }

        const isMatch = await user.comparePassword(password);

        if (!isMatch) {
            return res.status(400).json({
                message: "Contraseña incorrecta"
            });
        }

        res.status(200).json({
            message: "Login exitoso",
            user
        });

    } catch (error) {
        res.status(500).json({
            message: error.message
        });
    }
};


export const getUsers = async (req, res) => {
    try {
        
        const users = await User.find({ isActive: true});

        res.status(200).json({
            success: true,
            users
        });

    } catch(error) {
        res.status(500).json({
            succes: false,
            message: error.message
        });
    }
};

export const updateUser = async (req, res) => {
    try {
        
        const {id} = req.params;
        const data = req.body;

        const user = await user.findByIdAndUpdate(
            id,
            data,
            {new: true}
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
            success:false,
            message: error.message
        });
    }
}

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