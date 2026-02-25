import Cuenta from '../models/cuenta.model.js';
import User from '../models/user.model.js';
import crypto from 'crypto';

// Crear cuenta (Cliente - requiere aprobación)
export const crearCuenta = async (req, res) => {
    try {
        const { tipoCuenta, saldo, moneda } = req.body;
        
        // Si es cliente, solo puede crear para sí mismo
        const cuentaUserId = req.user.id;

        // Validar saldo mínimo según la moneda
        if (moneda === 'GTQ' && saldo < 100) {
            return res.status(400).json({
                success: false,
                message: 'El saldo mínimo para cuentas en Quetzales es Q100'
            });
        }

        if (moneda === 'USD' && saldo < 25) {
            return res.status(400).json({
                success: false,
                message: 'El saldo mínimo para cuentas en Dólares es $25'
            });
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

        // Crear cuenta pendiente de aprobación
        const cuenta = new Cuenta({
            numeroCuenta,
            userId: cuentaUserId,
            tipoCuenta: tipoCuenta || 'AHORRO',
            saldo,
            moneda,
            estado: 'ACTIVA',
            aprobada: false  // Cliente requiere aprobación
        });

        await cuenta.save();

        res.status(201).json({
            success: true,
            message: 'Solicitud de cuenta creada. Espera aprobación del administrador.',
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

// Crear cuenta como ADMIN (directamente aprobada)
export const crearCuentaByAdmin = async (req, res) => {
    try {
        const { tipoCuenta, userId, saldo, moneda } = req.body;
        
        // Admin puede crear para cualquier usuario
        const cuentaUserId = userId || req.user.id;

        // Validar saldo mínimo según la moneda
        if (moneda === 'GTQ' && saldo < 100) {
            return res.status(400).json({
                success: false,
                message: 'El saldo mínimo para cuentas en Quetzales es Q100'
            });
        }

        if (moneda === 'USD' && saldo < 25) {
            return res.status(400).json({
                success: false,
                message: 'El saldo mínimo para cuentas en Dólares es $25'
            });
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

        // Admin crea cuenta directamente aprobada
        const cuenta = new Cuenta({
            numeroCuenta,
            userId: cuentaUserId,
            tipoCuenta: tipoCuenta || 'AHORRO',
            saldo,
            moneda,
            estado: 'ACTIVA',
            aprobada: true  // Admin crea directamente aprobada
        });

        await cuenta.save();

        res.status(201).json({
            success: true,
            message: 'Cuenta creada exitosamente por administrador',
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

// Obtener todas las cuentas APROBADAS (Admin)
export const obtenerTodasCuentas = async (req, res) => {
    try {
        const { page = 1, limit = 10, estado } = req.query;

        const filter = { aprobada: true };
        if (estado) filter.estado = estado;

        const cuentas = await Cuenta.find(filter)
            .populate('userId', 'name email username rol')  // Incluye nombre y rol
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

    } catch (error) {
        console.error('Error obteniendo cuentas:', error);
        res.status(500).json({
            success: false,
            message: 'Error al obtener cuentas',
            error: error.message
        });
    }
};

// Obtener mis cuentas APROBADAS (Cliente o Admin)
export const obtenerMisCuentas = async (req, res) => {
    try {
        const userId = req.user.id;

        const cuentas = await Cuenta.find({ 
            userId,
            aprobada: true  // Solo mostrar cuentas aprobadas
        })
        .populate('userId', 'name email username rol')
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

// Obtener cuenta por ID
export const obtenerCuentaPorId = async (req, res) => {
    try {
        const { id } = req.params;
        const userId = req.user.id;
        const userRole = req.user.role;

        const cuenta = await Cuenta.findById(id)
            .populate('userId', 'name email username rol');

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
            .populate('userId', 'name email username rol');

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

// Actualizar cuenta (SOLO ADMIN)
export const actualizarCuenta = async (req, res) => {
    try {
        const { id } = req.params;
        const { tipoCuenta, estado } = req.body;

        const cuenta = await Cuenta.findById(id);

        if (!cuenta) {
            return res.status(404).json({
                success: false,
                message: 'Cuenta no encontrada'
            });
        }

        // Campos permitidos para actualizar
        const allowedUpdates = {};
        if (tipoCuenta) allowedUpdates.tipoCuenta = tipoCuenta;
        if (estado) allowedUpdates.estado = estado;

        const cuentaActualizada = await Cuenta.findByIdAndUpdate(
            id,
            { $set: allowedUpdates },
            { new: true, runValidators: true }
        ).populate('userId', 'name email username rol');

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

// Cambiar estado de cuenta (Admin)
export const cambiarEstadoCuenta = async (req, res) => {
    try {
        const { id } = req.params;
        const { estado } = req.body;

        const cuenta = await Cuenta.findByIdAndUpdate(
            id,
            { $set: { estado } },
            { new: true, runValidators: true }
        ).populate('userId', 'name email username rol');

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

// Cerrar cuenta es lo mismo que eliminar 
export const cerrarCuenta = async (req, res) => {
    try {
        const { id } = req.params;

        const cuenta = await Cuenta.findById(id);

        if (!cuenta) {
            return res.status(404).json({
                success: false,
                message: 'Cuenta no encontrada'
            });
        }

        // Cambiar estado a CERRADA (equivale a eliminada)
        cuenta.estado = 'CERRADA';
        await cuenta.save();

        res.status(200).json({
            success: true,
            message: 'Cuenta cerrada exitosamente',
            data: cuenta
        });

    } catch (error) {
        console.error('Error cerrando cuenta:', error);
        res.status(500).json({
            success: false,
            message: 'Error al cerrar cuenta',
            error: error.message
        });
    }
};


// Ver cuentas pendientes de aprobación (Admin)
export const obtenerCuentasPendientes = async (req, res) => {
    try {
        const { page = 1, limit = 10 } = req.query;

        const cuentas = await Cuenta.find({ aprobada: false })
            .populate('userId', 'name email username rol')
            .limit(limit * 1)
            .skip((page - 1) * limit)
            .sort({ createdAt: -1 });

        const total = await Cuenta.countDocuments({ aprobada: false });

        res.status(200).json({
            success: true,
            message: 'Cuentas pendientes de aprobación',
            data: cuentas,
            pagination: {
                total,
                page: parseInt(page),
                pages: Math.ceil(total / limit)
            }
        });

    } catch (error) {
        console.error('Error obteniendo cuentas pendientes:', error);
        res.status(500).json({
            success: false,
            message: 'Error al obtener cuentas pendientes',
            error: error.message
        });
    }
};

// Aprobar cuenta (Admin)
export const aprobarCuenta = async (req, res) => {
    try {
        const { id } = req.params;

        const cuenta = await Cuenta.findById(id);

        if (!cuenta) {
            return res.status(404).json({
                success: false,
                message: 'Cuenta no encontrada'
            });
        }

        if (cuenta.aprobada === true) {
            return res.status(400).json({
                success: false,
                message: 'Esta cuenta ya está aprobada'
            });
        }

        cuenta.aprobada = true;
        cuenta.estado = 'ACTIVA';
        await cuenta.save();

        const cuentaPopulada = await Cuenta.findById(id)
            .populate('userId', 'name email username rol');

        res.status(200).json({
            success: true,
            message: 'Cuenta aprobada exitosamente',
            data: cuentaPopulada
        });

    } catch (error) {
        console.error('Error aprobando cuenta:', error);
        res.status(500).json({
            success: false,
            message: 'Error al aprobar cuenta',
            error: error.message
        });
    }
};

// Rechazar/Desactivar cuenta (Admin)
export const desactivarCuenta = async (req, res) => {
    try {
        const { id } = req.params;

        const cuenta = await Cuenta.findById(id);

        if (!cuenta) {
            return res.status(404).json({
                success: false,
                message: 'Cuenta no encontrada'
            });
        }

        // Si está pendiente, rechazar (cerrar)
        if (cuenta.aprobada === false) {
            cuenta.estado = 'CERRADA';
            await cuenta.save();

            return res.status(200).json({
                success: true,
                message: 'Solicitud de cuenta rechazada',
                data: cuenta
            });
        }

        // Si ya está aprobada, desactivar (cerrar)
        cuenta.estado = 'CERRADA';
        await cuenta.save();

        res.status(200).json({
            success: true,
            message: 'Cuenta desactivada exitosamente',
            data: cuenta
        });

    } catch (error) {
        console.error('Error desactivando cuenta:', error);
        res.status(500).json({
            success: false,
            message: 'Error al desactivar cuenta',
            error: error.message
        });
    }
};

// Activar cuenta cerrada (Admin) - Reactivar cuenta
export const activarCuentaCerrada = async (req, res) => {
    try {
        const { id } = req.params;

        const cuenta = await Cuenta.findById(id);

        if (!cuenta) {
            return res.status(404).json({
                success: false,
                message: 'Cuenta no encontrada'
            });
        }

        if (cuenta.estado !== 'CERRADA') {
            return res.status(400).json({
                success: false,
                message: 'Solo se pueden reactivar cuentas cerradas'
            });
        }

        cuenta.estado = 'ACTIVA';
        cuenta.aprobada = true;
        await cuenta.save();

        const cuentaPopulada = await Cuenta.findById(id)
            .populate('userId', 'name email username rol');

        res.status(200).json({
            success: true,
            message: 'Cuenta reactivada exitosamente',
            data: cuentaPopulada
        });

    } catch (error) {
        console.error('Error reactivando cuenta:', error);
        res.status(500).json({
            success: false,
            message: 'Error al reactivar cuenta',
            error: error.message
        });
    }
};