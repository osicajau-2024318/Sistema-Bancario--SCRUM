import User from "../models/user.model.js";
import { generateJWT } from "../../helpers/generate-jwt.js";
import crypto from 'crypto';

// Registrar usuario (Público - requiere aprobación de admin)
export const registerUser = async (req, res) => {
    try {
        // Validar ingresos mínimos
        if (req.body.user_income_month < 100) {
            return res.status(400).json({
                success: false,
                message: 'Los ingresos mensuales deben ser al menos Q100'
            });
        }

        // Generar número de cuenta aleatorio (10 dígitos)
        let user_number_account;
        let exists = true;

        while (exists) {
            user_number_account = crypto.randomInt(1000000000, 9999999999).toString();
            const existing = await User.findOne({ user_number_account });
            if (!existing) exists = false;
        }

        const user = new User({
            ...req.body,
            user_number_account,
            user_type: 'CLIENTE',
            balance: 0,
            estado: false  // Requiere aprobación del admin
        });

        await user.save();

        res.status(201).json({
            success: true,
            message: "Registro exitoso. Tu cuenta será activada por un administrador pronto.",
            data: {
                id: user._id,
                user_name: user.user_name,
                user_username: user.user_username,
                user_email: user.user_email,
                user_number_account: user.user_number_account,
                estado: user.estado
            }
        });

    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message
        });
    }
};

// Registrar usuario como ADMIN (sin aprobación)
export const registerUserByAdmin = async (req, res) => {
    try {
        // Validar ingresos mínimos
        if (req.body.user_income_month < 100) {
            return res.status(400).json({
                success: false,
                message: 'Los ingresos mensuales deben ser al menos Q100'
            });
        }

        // Generar número de cuenta aleatorio (10 dígitos)
        let user_number_account;
        let exists = true;

        while (exists) {
            user_number_account = crypto.randomInt(1000000000, 9999999999).toString();
            const existing = await User.findOne({ user_number_account });
            if (!existing) exists = false;
        }

        const user = new User({
            ...req.body,
            user_number_account,
            user_type: req.body.user_type || 'CLIENTE',  // Admin puede especificar el tipo
            balance: 0,
            estado: true  // Admin crea usuarios directamente activos
        });

        await user.save();

        res.status(201).json({
            success: true,
            message: "Usuario creado exitosamente por administrador",
            data: {
                id: user._id,
                user_name: user.user_name,
                user_username: user.user_username,
                user_email: user.user_email,
                user_number_account: user.user_number_account,
                user_type: user.user_type,
                estado: user.estado
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
        const { user_email, user_password } = req.body;

        const user = await User.findOne({ user_email });

        if (!user) {
            return res.status(401).json({
                success: false,
                message: "Credenciales inválidas"
            });
        }

        const isMatch = await user.comparePassword(user_password);

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
                message: 'Tu cuenta aún no ha sido activada por un administrador. Por favor espera.'
            });
        }

        // Generar JWT
        const token = await generateJWT(user._id, { role: user.user_type });

        // Calcular expiración
        const expiresAt = new Date(Date.now() + 30 * 60 * 1000);

        res.status(200).json({
            success: true,
            message: "Login exitoso",
            token,
            data: {
                id: user._id,
                user_name: user.user_name,
                user_username: user.user_username,
                user_email: user.user_email,
                user_type: user.user_type,
                user_number_account: user.user_number_account,
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

// Ver todos los usuarios activos (Admin)
export const getUsers = async (req, res) => {
    try {
        const users = await User.find({ estado: true })
            .select('-user_password');

        res.status(200).json({
            success: true,
            data: users
        });

    } catch(error) {
        res.status(500).json({
            success: false,
            message: error.message
        });
    }
};

// Ver mi perfil (Cliente o Admin)
export const getMyProfile = async (req, res) => {
    try {
        const userId = req.user.id;

        const user = await User.findById(userId).select('-user_password');

        if (!user) {
            return res.status(404).json({
                success: false,
                message: 'Usuario no encontrado'
            });
        }

        res.status(200).json({
            success: true,
            data: user
        });

    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message
        });
    }
};

export const buscarUsuario = async (req, res) => {
    try {
        const { busqueda } = req.query;

        if (!busqueda) {
            return res.status(400).json({
                success: false,
                message: 'Debe proporcionar un término de búsqueda (email, username o DPI)'
            });
        }

        const usuario = await User.findOne({
            $or: [
                { user_email: busqueda },
                { user_username: busqueda },
                { user_dpi: busqueda }
            ]
        }).select('-user_password');

        if (!usuario) {
            return res.status(404).json({
                success: false,
                message: 'Usuario no encontrado'
            });
        }

        res.status(200).json({
            success: true,
            data: usuario
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
        ).select('-user_password');

        if (!user) {
            return res.status(404).json({
                success: false,
                message: "Error, usuario no encontrado"
            });
        }

        res.status(200).json({
            success: true,
            message: "Usuario actualizado correctamente",
            data: user
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
            { estado: false },
            { new: true }
        ).select('-user_password');

        if (!user) {
            return res.status(404).json({
                success: false,
                message: "Usuario no encontrado"
            });
        }

        res.status(200).json({
            success: true,
            message: "Usuario desactivado",
            data: user
        });

    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message
        });
    }
};

// Ver usuarios pendientes de activación (Admin)
export const obtenerUsuariosPendientes = async (req, res) => {
    try {
        const { page = 1, limit = 10 } = req.query;

        // Solo clientes con estado false (pendientes de aprobación)
        // Los admins nunca deberían estar pendientes
        const usuarios = await User.find({ estado: false, user_type: 'CLIENTE' })
            .select('-user_password')
            .limit(limit * 1)
            .skip((page - 1) * limit)
            .sort({ createdAt: -1 });

        const total = await User.countDocuments({ estado: false, user_type: 'CLIENTE' });

        res.status(200).json({
            success: true,
            message: 'Usuarios pendientes de activación',
            data: usuarios,
            pagination: {
                total,
                page: parseInt(page),
                pages: Math.ceil(total / limit)
            }
        });

    } catch (error) {
        console.error('Error obteniendo usuarios pendientes:', error);
        res.status(500).json({
            success: false,
            message: 'Error al obtener usuarios pendientes',
            error: error.message
        });
    }
};

// Activa el usuario (Admin)
export const activarUsuario = async (req, res) => {
    try {
        const { id } = req.params;

        const usuario = await User.findById(id);

        if (!usuario) {
            return res.status(404).json({
                success: false,
                message: 'Usuario no encontrado'
            });
        }

        if (usuario.estado === true) {
            return res.status(400).json({
                success: false,
                message: 'Este usuario ya está activo'
            });
        }

        usuario.estado = true;
        await usuario.save();

        res.status(200).json({
            success: true,
            message: 'Usuario activado exitosamente',
            data: {
                id: usuario._id,
                user_name: usuario.user_name,
                user_username: usuario.user_username,
                user_email: usuario.user_email,
                estado: usuario.estado
            }
        });

    } catch (error) {
        console.error('Error activando usuario:', error);
        res.status(500).json({
            success: false,
            message: 'Error al activar usuario',
            error: error.message
        });
    }
};

// Desactivar usuario (Admin)
export const desactivarUsuario = async (req, res) => {
    try {
        const { id } = req.params;

        const usuario = await User.findById(id);

        if (!usuario) {
            return res.status(404).json({
                success: false,
                message: 'Usuario no encontrado'
            });
        }

        if (usuario.user_type === 'ADMIN') {
            return res.status(403).json({
                success: false,
                message: 'No se puede desactivar un administrador'
            });
        }

        if (usuario.estado === false) {
            return res.status(400).json({
                success: false,
                message: 'Este usuario ya está inactivo'
            });
        }

        usuario.estado = false;
        await usuario.save();

        res.status(200).json({
            success: true,
            message: 'Usuario desactivado exitosamente',
            data: {
                id: usuario._id,
                user_name: usuario.user_name,
                user_username: usuario.user_username,
                user_email: usuario.user_email,
                estado: usuario.estado
            }
        });

    } catch (error) {
        console.error('Error desactivando usuario:', error);
        res.status(500).json({
            success: false,
            message: 'Error al desactivar usuario',
            error: error.message
        });
    }
};