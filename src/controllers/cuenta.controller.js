import Cuenta from '../models/cuenta.model.js';
import User from '../models/user.model.js';
import crypto from 'crypto';


export const crearCuenta = async (req, res) => {
    try {
        const { account_type, account_balance, moneda } = req.body;

        // Cliente SIEMPRE crea para sí mismo
        const cuentaUserId = req.user.id;

        // Validar saldo mínimo según moneda
        if (moneda === 'GTQ' && account_balance < 100) {
            return res.status(400).json({
                success: false,
                message: 'El saldo mínimo para cuentas en Quetzales es Q100'
            });
        }

        if (moneda === 'USD' && account_balance < 25) {
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

        // Generar número de cuenta único
        let account_number;
        let exists = true;

        while (exists) {
            account_number = crypto.randomInt(1000000000, 9999999999).toString();
            const existing = await Cuenta.findOne({ account_number });
            if (!existing) exists = false;
        }

        // Crear cuenta PENDIENTE de aprobación
        const cuenta = new Cuenta({
            account_number,
            user_id: cuentaUserId,
            account_type: account_type || 'AHORRO',
            account_balance,
            moneda,
            estado: 'PENDIENTE',
            aprobada: false  // Requiere aprobación
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


export const crearCuentaByAdmin = async (req, res) => {
    try {
        const { account_type, user_id, account_balance, moneda } = req.body;

        // Admin puede crear para cualquier usuario o para sí mismo
        const cuentaUserId = user_id || req.user.id;

        // Validar saldo mínimo según moneda
        if (moneda === 'GTQ' && account_balance < 100) {
            return res.status(400).json({
                success: false,
                message: 'El saldo mínimo para cuentas en Quetzales es Q100'
            });
        }

        if (moneda === 'USD' && account_balance < 25) {
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

        // Generar número de cuenta único
        let account_number;
        let exists = true;

        while (exists) {
            account_number = crypto.randomInt(1000000000, 9999999999).toString();
            const existing = await Cuenta.findOne({ account_number });
            if (!existing) exists = false;
        }

        // Admin crea cuenta DIRECTAMENTE APROBADA Y ACTIVA
        const cuenta = new Cuenta({
            account_number,
            user_id: cuentaUserId,
            account_type: account_type || 'AHORRO',
            account_balance,
            moneda,
            estado: 'ACTIVA',
            aprobada: true  // Directamente aprobada
        });

        await cuenta.save();

        // Poblar con información del usuario
        const cuentaCompleta = await Cuenta.findById(cuenta._id)
            .populate('user_id', 'user_name user_email user_username user_type');

        res.status(201).json({
            success: true,
            message: 'Cuenta creada exitosamente por administrador',
            data: cuentaCompleta
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

export const obtenerTodasCuentas = async (req, res) => {
    try {
        const { page = 1, limit = 10, estado } = req.query;

        // Solo cuentas aprobadas
        const filter = { aprobada: true };
        if (estado) filter.estado = estado;

        const cuentas = await Cuenta.find(filter)
            .populate('user_id', 'user_name user_email user_username user_type')
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


export const obtenerMisCuentas = async (req, res) => {
    try {
        const userId = req.user.id;

        const cuentas = await Cuenta.find({
            user_id: userId,
            aprobada: true  // Solo aprobadas
        })
        .populate('user_id', 'user_name user_email user_username user_type')
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


export const obtenerCuentaPorId = async (req, res) => {
    try {
        const { id } = req.params;
        const userId = req.user.id;
        const userRole = req.user.role;

        const cuenta = await Cuenta.findById(id)
            .populate('user_id', 'user_name user_email user_username user_type');

        if (!cuenta) {
            return res.status(404).json({
                success: false,
                message: 'Cuenta no encontrada'
            });
        }

        // Si no es admin, solo puede ver sus propias cuentas
        if (userRole !== 'ADMIN' && cuenta.user_id._id.toString() !== userId) {
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


export const obtenerCuentaPorNumero = async (req, res) => {
    try {
        const { account_number } = req.params;
        const userId = req.user.id;
        const userRole = req.user.role;

        const cuenta = await Cuenta.findOne({ account_number })
            .populate('user_id', 'user_name user_email user_username user_type');

        if (!cuenta) {
            return res.status(404).json({
                success: false,
                message: 'Cuenta no encontrada'
            });
        }

        // Si no es admin, solo puede ver sus propias cuentas
        if (userRole !== 'ADMIN' && cuenta.user_id._id.toString() !== userId) {
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


export const actualizarCuenta = async (req, res) => {
    try {
        const { id } = req.params;
        const { account_type, estado } = req.body;

        const cuenta = await Cuenta.findById(id);

        if (!cuenta) {
            return res.status(404).json({
                success: false,
                message: 'Cuenta no encontrada'
            });
        }

        const allowedUpdates = {};
        if (account_type) allowedUpdates.account_type = account_type;
        if (estado) allowedUpdates.estado = estado;

        const cuentaActualizada = await Cuenta.findByIdAndUpdate(
            id,
            { $set: allowedUpdates },
            { new: true, runValidators: true }
        ).populate('user_id', 'user_name user_email user_username user_type');

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


export const cambiarEstadoCuenta = async (req, res) => {
    try {
        const { id } = req.params;
        const { estado } = req.body;

        const cuenta = await Cuenta.findByIdAndUpdate(
            id,
            { $set: { estado } },
            { new: true, runValidators: true }
        ).populate('user_id', 'user_name user_email user_username user_type');

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


export const obtenerCuentasPendientes = async (req, res) => {
    try {
        const { page = 1, limit = 10 } = req.query;

        // Buscar SOLO cuentas pendientes (aprobada: false)
        const cuentas = await Cuenta.find({ aprobada: false })
            .populate('user_id', 'user_name user_email user_username user_type')
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

        // Aprobar cuenta
        cuenta.aprobada = true;
        cuenta.estado = 'ACTIVA';
        await cuenta.save();

        // Poblar información del usuario
        const cuentaPopulada = await Cuenta.findById(id)
            .populate('user_id', 'user_name user_email user_username user_type');

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

        // Si está pendiente, la rechazamos (cerramos)
        if (cuenta.aprobada === false) {
            cuenta.estado = 'CERRADA';
            await cuenta.save();

            return res.status(200).json({
                success: true,
                message: 'Solicitud de cuenta rechazada',
                data: cuenta
            });
        }

        // Si ya está aprobada, la desactivamos (cerramos)
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

        // Reactivar cuenta
        cuenta.estado = 'ACTIVA';
        cuenta.aprobada = true;
        await cuenta.save();

        const cuentaPopulada = await Cuenta.findById(id)
            .populate('user_id', 'user_name user_email user_username user_type');

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