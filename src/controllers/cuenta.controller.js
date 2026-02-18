import Cuenta from '../models/cuenta.model.js';
import User from '../models/user.model.js';
import crypto from 'crypto';

// Crear cuenta 
export const crearCuenta = async (req, res) => {
    try {
        const { tipoCuenta, userId } = req.body;
        
        // Si es cliente, solo puede crear para sí mismo
        let cuentaUserId = userId;
        if (req.user.role !== 'ADMIN') {
            cuentaUserId = req.user.id;
        }

        // Verificar que el usuario exista
        const usuario = await User.findById(cuentaUserId);
        if (!usuario) {
            return res.status(404).json({
                success: false,
                message: 'Usuario no encontrado'
            });
        }

        // Generar número de cuenta aleatorio (10 dígitos)
        let numeroCuenta;
        let exists = true;
        
        while (exists) {
            numeroCuenta = crypto.randomInt(1000000000, 9999999999).toString();
            const existing = await Cuenta.findOne({ numeroCuenta });
            if (!existing) exists = false;
        }

        // Crear cuenta
        const cuenta = new Cuenta({
            numeroCuenta,
            userId: cuentaUserId,
            tipoCuenta: tipoCuenta || 'AHORRO',
            saldo: 0,
            moneda: 'GTQ',
            estado: 'ACTIVA'
        });

        await cuenta.save();

        res.status(201).json({
            success: true,
            message: 'Cuenta creada exitosamente',
            data: cuenta
        });

    } catch (error) {
        console.error('Error creando cuenta:', error);
        res.status(500).json({
            success: false,
            message: 'Error al crear cuenta',
            error: error.message
        });
    }
};

// Obtener todas las cuentas (Solo Admin)
export const obtenerTodasCuentas = async (req, res) => {
    try {
        const { page = 1, limit = 10, estado } = req.query;

        const filter = {};
        if (estado) filter.estado = estado;

        const cuentas = await Cuenta.find(filter)
            .populate('userId', 'name email username numeroCuenta')
            .limit(limit * 1)
            .skip((page - 1) * limit)
            .sort({ createdAt: -1 });

        const total = await Cuenta.countDocuments(filter);

        res.status(200).json({
            success: true,
            data: cuentas,
            pagination: {
                total,
                page: parseInt(page),
                pages: Math.ceil(total / limit)
            }
        });
        // Atrape el weeoe para la obtencion de las cuentas
    } catch (error) {
        console.error('Error obteniendo cuentas:', error);
        res.status(500).json({
            success: false,
            message: 'Error al obtener cuentas',
            error: error.message
        });
    }
};

// Ver  cuentas del usuario en logueado
export const obtenerMisCuentas = async (req, res) => {
    try {
        const userId = req.user.id;

        const cuentas = await Cuenta.find({ userId })
            .sort({ createdAt: -1 });

        res.status(200).json({
            success: true,
            data: cuentas
        });

    } catch (error) {
        console.error('Error obteniendo mis cuentas:', error);
        res.status(500).json({
            success: false,
            message: 'Error al obtener cuentas',
            error: error.message
        });
    }
};

// Obtener cuenta por Id
export const obtenerCuentaPorId = async (req, res) => {
    try {
        const { id } = req.params;
        const userId = req.user.id;
        const userRole = req.user.role;

        const cuenta = await Cuenta.findById(id)
            .populate('userId', 'name email userna');

        if (!cuenta) {
            return res.status(404).json({
                success: false,
                message: 'Cuenta no encontrada'
            });
        }

        // Si no es admin, solo puede ver sus propias cuentas
        if (userRole !== 'ADMIN' && cuenta.userId._id.toString() !== userId) {
            return res.status(403).json({
                success: false,
                message: 'No tienes permisos para ver esta cuenta'
            });
        }

        res.status(200).json({
            success: true,
            data: cuenta
        });

    } catch (error) {
        console.error('Error obteniendo cuenta:', error);
        res.status(500).json({
            success: false,
            message: 'Error al obtener cuenta',
            error: error.message
        });
    }
};

// Obtener cuenta por número de cuenta
export const obtenerCuentaPorNumero = async (req, res) => {
    try {
        const { numeroCuenta } = req.params;
        const userId = req.user.id;
        const userRole = req.user.role;

        const cuenta = await Cuenta.findOne({ numeroCuenta })
            .populate('userId', 'name email username');

        if (!cuenta) {
            return res.status(404).json({
                success: false,
                message: 'Cuenta no encontrada'
            });
        }

        // Si no es admin, solo puede ver sus propias cuentas
        if (userRole !== 'ADMIN' && cuenta.userId._id.toString() !== userId) {
            return res.status(403).json({
                success: false,
                message: 'No tienes permisos para ver esta cuenta'
            });
        }

        res.status(200).json({
            success: true,
            data: cuenta
        });

    } catch (error) {
        console.error('Error obteniendo cuenta:', error);
        res.status(500).json({
            success: false,
            message: 'Error al obtener cuenta',
            error: error.message
        });
    }
};

// Actualizar cuenta "Solo lo puede hacer el Admin y el dueño de la cuenta"
export const actualizarCuenta = async (req, res) => {
    try {
        const { id } = req.params;
        const { tipoCuenta, estado } = req.body;
        const userId = req.user.id;
        const userRole = req.user.role;

        const cuenta = await Cuenta.findById(id);

        if (!cuenta) {
            return res.status(404).json({
                success: false,
                message: 'Cuenta no encontrada'
            });
        }

        // Si no es admin, solo puede actualizar sus propias cuentas
        if (userRole !== 'ADMIN' && cuenta.userId.toString() !== userId) {
            return res.status(403).json({
                success: false,
                message: 'No tiene permisos para actualizar esta cuenta'
            });
        }

        
        const allowedUpdates = {};
        if (tipoCuenta) allowedUpdates.tipoCuenta = tipoCuenta;
        
        // Solo admin puede cambiar el estado
        if (estado && userRole === 'ADMIN') {
            allowedUpdates.estado = estado;
        }

        const cuentaActualizada = await Cuenta.findByIdAndUpdate(
            id,
            { $set: allowedUpdates },
            { new: true, runValidators: true }
        ).populate('userId', 'name email username');

        res.status(200).json({
            success: true,
            message: 'Cuenta actualizada exitosamente',
            data: cuentaActualizada
        });

    } catch (error) {
        console.error('Error actualizando cuenta:', error);
        res.status(500).json({
            success: false,
            message: 'Error al actualizar cuenta',
            error: error.message
        });
    }
};

// Cambiar el estado de la ceunta "Solo el ADMIN lo puede hacer"
export const cambiarEstadoCuenta = async (req, res) => {
    try {
        const { id } = req.params;
        const { estado } = req.body;

        const cuenta = await Cuenta.findByIdAndUpdate(
            id,
            { $set: { estado } },
            { new: true, runValidators: true }
        ).populate('userId', 'name email username');

        if (!cuenta) {
            return res.status(404).json({
                success: false,
                message: 'Cuenta no encontrada'
            });
        }

        res.status(200).json({
            success: true,
            message: `Cuenta ${estado.toLowerCase()} exitosamente`,
            data: cuenta
        });

    } catch (error) {
        console.error('Error cambiando estado:', error);
        res.status(500).json({
            success: false,
            message: 'Error al cambiar estado de cuenta',
            error: error.message
        });
    }
};

// Eliminar cuenta "Solo el ADMIN lo puede hacer"
export const eliminarCuenta = async (req, res) => {
    try {
        const { id } = req.params;

        const cuenta = await Cuenta.findById(id);

        if (!cuenta) {
            return res.status(404).json({
                success: false,
                message: 'Cuenta no encontrada'
            });
        }

        // Verificar que el saldo sea 0
        if (cuenta.saldo > 0) {
            return res.status(400).json({
                success: false,
                message: 'No se puede eliminar una cuenta con saldo positivo'
            });

        }

        // Cambia el estado a CERRADA
        cuenta.estado = 'CERRADA';
        await cuenta.save();

        res.status(200).json({
            success: true,
            message: 'Cuenta cerrada exitosamente',
            data: cuenta
        });

        //Atrapa los errores de la cuenta
    } catch (error) {
        console.error('Error eliminando cuenta:', error);
        res.status(500).json({
            success: false,
            message: 'Error al eliminar cuenta',
            error: error.message
        });
    }
};