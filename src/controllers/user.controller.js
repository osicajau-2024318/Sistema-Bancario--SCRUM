import User from "../models/user.model.js";
import { generateJWT } from "../../helpers/generate-jwt.js";
import crypto from 'crypto';

export const registerUser = async (req, res) => {
    try {
        // Validar ingresos mínimos
        if (req.body.monthlyIncome < 100) {
            return res.status(400).json({
                success: false,
                message: 'Los ingresos mensuales deben ser al menos Q100'
            });
        }

        // Generar número de cuenta aleatorio (10 dígitos)
        let numeroCuenta;
        let exists = true;
        
        while (exists) {
            numeroCuenta = crypto.randomInt(1000000000, 9999999999).toString();
            const existing = await User.findOne({ numeroCuenta });
            if (!existing) exists = false;
        }

        const user = new User({
            ...req.body,
            numeroCuenta,
            rol: 'CLIENTE',
            balance: 0
        });
        
        await user.save();

        res.status(201).json({
            success: true,
            message: "Usuario registrado con éxito",
            data: {
                id: user._id,
                name: user.name,
                username: user.username,
                email: user.email,
                numeroCuenta: user.numeroCuenta
            }
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
            return res.status(401).json({
                success: false,
                message: "Credenciales inválidas"
            });
        }

        const isMatch = await user.comparePassword(password);

        if (!isMatch) {
            return res.status(401).json({
                success: false,
                message: "Credenciales inválidas"
            });
        }

        // Verificar si está activo
        if (!user.estado) {
            return res.status(423).json({
                success: false,
                message: 'Cuenta desactivada'
            });
        }

        // Generar JWT
        const token = await generateJWT(user._id, { role: user.rol });

        // Calcular expiración
        const expiresAt = new Date(Date.now() + 30 * 60 * 1000);

        res.status(200).json({
            success: true,
            message: "Login exitoso",
            token,
            data: {
                id: user._id,
                name: user.name,
                username: user.username,
                email: user.email,
                rol: user.rol,
                numeroCuenta: user.numeroCuenta,
                balance: user.balance
            },
            expiresAt
        });

    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message
        });
    }
};

export const getUsers = async (req, res) => {
    try {
        const users = await User.find({ estado: true });

        res.status(200).json({
            success: true,
            users
        });

    } catch(error) {
        res.status(500).json({
            success: false,
            message: error.message
        });
    }
};

export const updateUser = async (req, res) => {
    try {
        const {id} = req.params;
        const data = req.body;

        const user = await User.findByIdAndUpdate(
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
            { estado: false },
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