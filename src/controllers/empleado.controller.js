import Empleado from '../models/empleado.model.js';
import Cuenta from '../models/cuenta.model.js';
import User from '../models/user.model.js';
import { generateJWT } from '../../helpers/generate-jwt.js';
import crypto from 'crypto';

export const registerEmpleado = async (req, res) => {
    try {
        const { empleado_age, empleado_salary } = req.body;

        // Validar edad mínima
        if (empleado_age < 18) {
            return res.status(400).json({
                success: false,
                message: 'La edad mínima para ser empleado es 18 años'
            });
        }

        // Validar salario mínimo
        if (empleado_salary < 0) {
            return res.status(400).json({
                success: false,
                message: 'El salario no puede ser negativo'
            });
        }

        const empleado = new Empleado({
            ...req.body,
            empleado_state: false,  // Requiere aprobación del admin
            empleado_type: 'EMPLEADO'
        });
        
        await empleado.save();

        res.status(201).json({
            success: true,
            message: "Solicitud de registro de empleado enviada. Espera aprobación del administrador.",
            data: {
                id: empleado._id,
                empleado_name: empleado.empleado_name,
                empleado_surname: empleado.empleado_surname,
                empleado_email: empleado.empleado_email,
                empleado_post: empleado.empleado_post,
                empleado_state: empleado.empleado_state
            }
        });

    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message
        });
    }
};

export const registerEmpleadoByAdmin = async (req, res) => {
    try {
        const { empleado_age, empleado_salary } = req.body;

        if (empleado_age < 18) {
            return res.status(400).json({
                success: false,
                message: 'La edad mínima para ser empleado es 18 años'
            });
        }

        if (empleado_salary < 0) {
            return res.status(400).json({
                success: false,
                message: 'El salario no puede ser negativo'
            });
        }

        const empleado = new Empleado({
            ...req.body,
            empleado_state: true,  // Admin crea empleados directamente activos
            empleado_type: 'EMPLEADO'
        });
        
        await empleado.save();

        res.status(201).json({
            success: true,
            message: "Empleado creado exitosamente por administrador",
            data: {
                id: empleado._id,
                empleado_name: empleado.empleado_name,
                empleado_surname: empleado.empleado_surname,
                empleado_email: empleado.empleado_email,
                empleado_post: empleado.empleado_post,
                empleado_dpi: empleado.empleado_dpi,
                empleado_age: empleado.empleado_age,
                empleado_salary: empleado.empleado_salary,
                empleado_state: empleado.empleado_state
            }
        });

    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message
        });
    }
};

export const loginEmpleado = async (req, res) => {
    try {
        const { empleado_email, empleado_password } = req.body;

        const empleado = await Empleado.findOne({ empleado_email });

        if (!empleado) {
            return res.status(401).json({
                success: false,
                message: "Credenciales inválidas"
            });
        }

        const isMatch = await empleado.comparePassword(empleado_password);

        if (!isMatch) {
            return res.status(401).json({
                success: false,
                message: "Credenciales inválidas"
            });
        }

        // Verificar si está activo
        if (!empleado.empleado_state) {
            return res.status(423).json({
                success: false,
                message: 'Tu cuenta de empleado aún no ha sido activada por un administrador. Por favor espera.'
            });
        }

        // Generar JWT con rol EMPLEADO
        const token = await generateJWT(empleado._id, { role: 'EMPLEADO' });

        const expiresAt = new Date(Date.now() + 30 * 60 * 1000);

        res.status(200).json({
            success: true,
            message: "Login exitoso",
            token,
            data: {
                id: empleado._id,
                empleado_name: empleado.empleado_name,
                empleado_surname: empleado.empleado_surname,
                empleado_email: empleado.empleado_email,
                empleado_post: empleado.empleado_post,
                empleado_type: empleado.empleado_type
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

export const getMyProfile = async (req, res) => {
    try {
        const empleadoId = req.user.id;

        const empleado = await Empleado.findById(empleadoId);

        if (!empleado) {
            return res.status(404).json({
                success: false,
                message: 'Empleado no encontrado'
            });
        }

        res.status(200).json({
            success: true,
            data: empleado
        });

    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message
        });
    }
};

// ========================================
// ACTUALIZAR MI PERFIL (Empleado)
// ========================================
export const updateMyProfile = async (req, res) => {
    try {
        const empleadoId = req.user.id;

        const empleado = await Empleado.findByIdAndUpdate(
            empleadoId,
            req.body,
            { new: true, runValidators: true }
        );

        if (!empleado) {
            return res.status(404).json({
                success: false,
                message: "Empleado no encontrado"
            });
        }

        res.status(200).json({
            success: true,
            message: "Perfil actualizado correctamente",
            data: empleado
        });

    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message
        });
    }
};

export const crearCuentaEmpleado = async (req, res) => {
    try {
        const { account_type, user_id, account_balance, moneda } = req.body;

        // Empleado puede crear cuenta para cualquier usuario
        const cuentaUserId = user_id;

        if (!cuentaUserId) {
            return res.status(400).json({
                success: false,
                message: 'El ID del usuario es obligatorio'
            });
        }

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

        // EMPLEADO crea cuenta DIRECTAMENTE APROBADA (diferencia con CLIENTE)
        const cuenta = new Cuenta({
            account_number,
            user_id: cuentaUserId,
            account_type: account_type || 'AHORRO',
            account_balance,
            moneda,
            estado: 'ACTIVA',
            aprobada: true  // Empleado crea cuentas directamente aprobadas
        });

        await cuenta.save();

        const cuentaCompleta = await Cuenta.findById(cuenta._id)
            .populate('user_id', 'user_name user_email user_username user_type');

        res.status(201).json({
            success: true,
            message: 'Cuenta creada exitosamente por empleado',
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


export const getMisCuentasEmpleado = async (req, res) => {
    try {

        const { page = 1, limit = 10, estado } = req.query;

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
            message: 'Cuentas activas del sistema',
            data: cuentas,
            pagination: {
                total,
                page: parseInt(page),
                pages: Math.ceil(total / limit)
            }
        });

    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message
        });
    }
};

// ========================================
// ACTUALIZAR CUENTA (Empleado puede actualizar tipo y estado)
// ========================================
export const actualizarCuentaEmpleado = async (req, res) => {
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

        // Empleado solo puede actualizar cuentas aprobadas
        if (!cuenta.aprobada) {
            return res.status(400).json({
                success: false,
                message: 'No se puede actualizar una cuenta pendiente de aprobación'
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
        res.status(500).json({
            success: false,
            message: error.message
        });
    }
};


export const buscarCuentaEmpleado = async (req, res) => {
    try {
        const { busqueda } = req.query;

        if (!busqueda) {
            return res.status(400).json({
                success: false,
                message: 'Debe proporcionar un número de cuenta o ID'
            });
        }

        const cuenta = await Cuenta.findOne({
            $or: [
                { account_number: busqueda }
            ]
        }).populate('user_id', 'user_name user_email user_username user_type');

        if (!cuenta) {
            return res.status(404).json({
                success: false,
                message: 'Cuenta no encontrada'
            });
        }

        res.status(200).json({
            success: true,
            data: cuenta
        });

    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message
        });
    }
};

export const verUsuarios = async (req, res) => {
    try {
        const { page = 1, limit = 10 } = req.query;

        const usuarios = await User.find({ estado: true })
            .select('-user_password')
            .limit(limit * 1)
            .skip((page - 1) * limit)
            .sort({ createdAt: -1 });

        const total = await User.countDocuments({ estado: true });

        res.status(200).json({
            success: true,
            data: usuarios,
            pagination: {
                total,
                page: parseInt(page),
                pages: Math.ceil(total / limit)
            }
        });

    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message
        });
    }
};


export const verCuentas = async (req, res) => {
    try {
        const { page = 1, limit = 10, estado } = req.query;

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
                message: 'Debe proporcionar un término de búsqueda'
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


export const getEmpleados = async (req, res) => {
    try {
        const { page = 1, limit = 10 } = req.query;

        const empleados = await Empleado.find({ empleado_state: true })
            .limit(limit * 1)
            .skip((page - 1) * limit)
            .sort({ createdAt: -1 });

        const total = await Empleado.countDocuments({ empleado_state: true });

        res.status(200).json({
            success: true,
            data: empleados,
            pagination: {
                total,
                page: parseInt(page),
                pages: Math.ceil(total / limit)
            }
        });

    } catch(error) {
        res.status(500).json({
            success: false,
            message: error.message
        });
    }
};

export const buscarEmpleado = async (req, res) => {
    try {
        const { busqueda } = req.query;

        if (!busqueda) {
            return res.status(400).json({
                success: false,
                message: 'Debe proporcionar un término de búsqueda'
            });
        }

        const empleado = await Empleado.findOne({
            $or: [
                { empleado_email: busqueda },
                { empleado_dpi: busqueda }
            ]
        });

        if (!empleado) {
            return res.status(404).json({
                success: false,
                message: 'Empleado no encontrado'
            });
        }

        res.status(200).json({
            success: true,
            data: empleado
        });

    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message
        });
    }
};

export const updateEmpleado = async (req, res) => {
    try {
        const { id } = req.params;

        const empleado = await Empleado.findByIdAndUpdate(
            id,
            req.body,
            { new: true, runValidators: true }
        );

        if (!empleado) {
            return res.status(404).json({
                success: false,
                message: "Empleado no encontrado"
            });
        }

        res.status(200).json({
            success: true,
            message: "Empleado actualizado correctamente",
            data: empleado
        });

    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message
        });
    }
};

export const deleteEmpleado = async (req, res) => {
    try {
        const { id } = req.params;

        const empleado = await Empleado.findByIdAndUpdate(
            id,
            { empleado_state: false },
            { new: true }
        );

        if (!empleado) {
            return res.status(404).json({
                success: false,
                message: "Empleado no encontrado"
            });
        }

        res.status(200).json({
            success: true,
            message: "Empleado desactivado",
            data: empleado
        });

    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message
        });
    }
};

export const obtenerEmpleadosPendientes = async (req, res) => {
    try {
        const { page = 1, limit = 10 } = req.query;

        const empleados = await Empleado.find({ empleado_state: false })
            .limit(limit * 1)
            .skip((page - 1) * limit)
            .sort({ createdAt: -1 });

        const total = await Empleado.countDocuments({ empleado_state: false });

        res.status(200).json({
            success: true,
            message: 'Empleados pendientes de activación',
            data: empleados,
            pagination: {
                total,
                page: parseInt(page),
                pages: Math.ceil(total / limit)
            }
        });

    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Error al obtener empleados pendientes',
            error: error.message
        });
    }
};

export const activarEmpleado = async (req, res) => {
    try {
        const { id } = req.params;

        const empleado = await Empleado.findById(id);

        if (!empleado) {
            return res.status(404).json({
                success: false,
                message: 'Empleado no encontrado'
            });
        }

        if (empleado.empleado_state === true) {
            return res.status(400).json({
                success: false,
                message: 'Este empleado ya está activo'
            });
        }

        empleado.empleado_state = true;
        await empleado.save();

        res.status(200).json({
            success: true,
            message: 'Empleado activado exitosamente',
            data: empleado
        });

    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Error al activar empleado',
            error: error.message
        });
    }
};

export const desactivarEmpleado = async (req, res) => {
    try {
        const { id } = req.params;

        const empleado = await Empleado.findById(id);

        if (!empleado) {
            return res.status(404).json({
                success: false,
                message: 'Empleado no encontrado'
            });
        }

        if (empleado.empleado_state === false) {
            return res.status(400).json({
                success: false,
                message: 'Este empleado ya está inactivo'
            });
        }

        empleado.empleado_state = false;
        await empleado.save();

        res.status(200).json({
            success: true,
            message: 'Empleado desactivado exitosamente',
            data: empleado
        });

    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Error al desactivar empleado',
            error: error.message
        });
    }
};