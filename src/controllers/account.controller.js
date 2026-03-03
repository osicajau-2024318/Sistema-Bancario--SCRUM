import mongoose from 'mongoose';
import Account from '../models/account.model.js';
import { convertCurrency } from '../services/currency.service.js';
import { verifyUserExists, verifyMonthlyIncome, createClientInAuthService } from '../services/authService.service.js';
import Transaction from '../models/transaction.model.js';

const isAccountActive = (account) => {
  if (typeof account?.estado === 'string') {
    return account.estado === 'ACTIVA';
  }

  if (typeof account?.active === 'boolean') {
    return account.active;
  }

  if (typeof account?.is_active === 'boolean') {
    return account.is_active;
  }

  return true;
};

// Crear cuenta Y usuario (solo admin)
// NUEVO FLUJO: Crea el usuario primero en .NET, luego crea la cuenta en MongoDB
// Funciona con JSON y form-data
export const createAccount = async (req, res) => {
  try {
    let { 
      name, surname, username, email, password, phone,
      dpi, address, workName, monthlyIncome, account_type 
    } = req.body;
    
    // Convertir monthlyIncome a número si es string (desde form-data)
    monthlyIncome = parseFloat(monthlyIncome);
    
    const token = req.headers.authorization?.split(' ')[1];

    if (!token) {
      return res.status(401).json({ 
        success: false, 
        message: 'Token de autenticación requerido' 
      });
    }

    // Verificar que los ingresos mensuales sean >= Q100
    if (monthlyIncome < 100) {
      return res.status(400).json({ 
        success: false, 
        message: 'No se puede crear la cuenta. Ingresos mensuales deben ser >= Q100' 
      });
    }

    // 1. Crear usuario en .NET (PostgreSQL)
    let userCreationResult;
    try {
      userCreationResult = await createClientInAuthService({
        name,
        surname,
        username,
        email,
        password,
        phone,
        dpi: dpi || '',
        address: address || '',
        workName: workName || '',
        monthlyIncome
      }, token);
    } catch (error) {
      return res.status(error.response?.status || 500).json({
        success: false,
        message: error.response?.data?.message || 'Error al crear usuario en sistema de autenticación',
        details: error.response?.data
      });
    }

    const userId = userCreationResult.data.id;

    // 2. Generar número de cuenta aleatorio
    const account_number = Math.floor(1000000000 + Math.random() * 9000000000).toString();

    // 3. Crear cuenta bancaria en MongoDB
    const account = new Account({
      user_id: userId,
      account_type: account_type || 'AHORRO',
      account_number
    });

    await account.save();

    // 4. Devolver respuesta completa
    res.status(201).json({
      success: true,
      message: 'Usuario y cuenta creados exitosamente',
      user: userCreationResult.data,
      account: {
        id: account._id,
        user_id: account.user_id,
        account_number: account.account_number,
        account_type: account.account_type,
        balance: account.balance,
        active: isAccountActive(account),
        estado: account.estado
      }
    });

  } catch (error) {
    res.status(500).json({ 
      success: false, 
      message: 'Error al crear cuenta', 
      error: error.message 
    });
  }
};

// Obtener cuentas del usuario
export const getMyAccount = async (req, res) => {
  const userId = req.user.id;

  const account = await Account.findOne({ user_id: userId });
  res.json(account);
};

// Transferencia
export const transfer = async (req, res) => {
  try {
    const fromUserId = req.user.id;
    const { toAccount, amount, description } = req.body;

    // Validar que el monto sea válido
    if (!amount || amount <= 0) {
      return res.status(400).json({
        success: false,
        message: 'El monto debe ser mayor a 0'
      });
    }

    const fromAccount = await Account.findOne({ user_id: fromUserId });
    
    if (!fromAccount) {
      return res.status(404).json({
        success: false,
        message: 'Cuenta origen no encontrada'
      });
    }

    if (!isAccountActive(fromAccount)) {
      return res.status(400).json({
        success: false,
        message: 'Tu cuenta no está activa'
      });
    }

    const toAccountData = await Account.findOne({ account_number: toAccount });

    if (!toAccountData) {
      return res.status(404).json({
        success: false,
        message: 'Cuenta destino no existe'
      });
    }

    if (!isAccountActive(toAccountData)) {
      return res.status(400).json({
        success: false,
        message: 'La cuenta destino no está activa'
      });
    }

    // No permitir transferencias a la misma cuenta
    if (fromAccount.account_number === toAccountData.account_number) {
      return res.status(400).json({
        success: false,
        message: 'No puedes transferir a tu propia cuenta'
      });
    }

    // Verificar límite por transferencia (Q2000)
    if (amount > fromAccount.single_transfer_limit) {
      return res.status(400).json({
        success: false,
        message: `Supera el límite por transferencia de Q${fromAccount.single_transfer_limit}`
      });
    }

    // Verificar límite diario (Q10,000)
    const today = new Date().toDateString();
    const lastDate = fromAccount.last_transfer_date?.toDateString();

    if (today !== lastDate) {
      fromAccount.daily_transferred_amount = 0;
      fromAccount.last_transfer_date = new Date();
    }

    if (fromAccount.daily_transferred_amount + amount > fromAccount.daily_transfer_limit) {
      const remaining = fromAccount.daily_transfer_limit - fromAccount.daily_transferred_amount;
      return res.status(400).json({
        success: false,
        message: `Supera el límite diario de transferencias. Disponible hoy: Q${remaining}`
      });
    }

    // Verificar saldo suficiente
    if (fromAccount.balance < amount) {
      return res.status(400).json({
        success: false,
        message: 'Saldo insuficiente'
      });
    }

    // Realizar la transferencia
    fromAccount.balance -= amount;
    toAccountData.balance += amount;

    fromAccount.daily_transferred_amount += amount;

    await fromAccount.save();
    await toAccountData.save();

    // Crear registro de transacción
    const transaction = new Transaction({
      transaction_name: description || 'Transferencia',
      transaction_amount: amount,
      transaction_type: 'TRANSFERENCIA',
      transaction_method_payment: 'TRANSFERENCIA',
      from_account: fromAccount.account_number,
      to_account: toAccountData.account_number,
      account_id: fromAccount._id,
      user_id: fromUserId,
      revertible: false
    });

    await transaction.save();

    res.json({
      success: true,
      message: 'Transferencia realizada exitosamente',
      transaction: {
        amount,
        from: fromAccount.account_number,
        to: toAccountData.account_number,
        newBalance: fromAccount.balance,
        dailyRemaining: fromAccount.daily_transfer_limit - fromAccount.daily_transferred_amount
      }
    });

  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error al procesar transferencia',
      error: error.message
    });
  }
};

export const getAccountById = async (req, res) => {
  try {
    const { id } = req.params;

    // Validar formato de ObjectId
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ success: false, message: 'ID de cuenta inválido' });
    }

    const account = await Account.findById(id);

    if (!account) {
      return res.status(404).json({ success: false, message: 'Cuenta no encontrada' });
    }

    let saldoConvertido = null;

    // Si el cliente pide otra moneda
    if (req.query.currency) {
      saldoConvertido = await convertCurrency('GTQ', req.query.currency, account.balance);
    }

    res.json({
      success: true,
      account,
      saldoConvertido
    });

  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// Admin: Ver cuentas por actividad
export const getAccountsByActivity = async (req, res) => {
  try {
    const { active } = req.query;
    
    const filter = {};
    if (active !== undefined) {
      filter.is_active = active === 'true';
    }

    const accounts = await Account.find(filter)
      .sort({ updatedAt: -1 });

    res.json({
      success: true,
      count: accounts.length,
      accounts
    });

  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error al obtener cuentas',
      error: error.message
    });
  }
};
// Admin: Ver cuentas con más movimientos (ordenado ASC o DESC)
export const getAccountsByMovements = async (req, res) => {
  try {
    const { order = 'desc' } = req.query; // 'asc' o 'desc'

    // Obtener todas las cuentas
    const accounts = await Account.find();

    // Calcular cantidad de movimientos para cada cuenta
    const accountsWithMovements = await Promise.all(
      accounts.map(async (account) => {
        const movementsCount = await Transaction.countDocuments({
          $or: [
            { from_account: account.account_number },
            { to_account: account.account_number },
            { account_id: account._id }
          ]
        });

        return {
          ...account.toObject(),
          movementsCount
        };
      })
    );

    // Ordenar por cantidad de movimientos
    const sortOrder = order === 'asc' ? 1 : -1;
    accountsWithMovements.sort((a, b) => sortOrder * (a.movementsCount - b.movementsCount));

    res.json({
      success: true,
      count: accountsWithMovements.length,
      accounts: accountsWithMovements
    });

  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error al obtener cuentas por movimientos',
      error: error.message
    });
  }
};

// Admin: Ver últimos 5 movimientos de una cuenta y su saldo
export const getAccountMovements = async (req, res) => {
  try {
    const { accountId } = req.params;

    // Validar formato de ObjectId
    if (!mongoose.Types.ObjectId.isValid(accountId)) {
      return res.status(400).json({ success: false, message: 'ID de cuenta inválido' });
    }

    const account = await Account.findById(accountId);

    if (!account) {
      return res.status(404).json({ success: false, message: 'id de cuenta no encontrado' });
    }

    // Obtener últimos 5 movimientos
    const movements = await Transaction.find({
      $or: [
        { from_account: account.account_number },
        { to_account: account.account_number },
        { account_id: account._id }
      ],
      transaction_type: { $in: ['TRANSFERENCIA', 'COMPRA', 'CREDITO'] }
    })
      .sort({ createdAt: -1 })
      .limit(5);

    res.json({
      success: true,
      account: {
        id: account._id,
        account_number: account.account_number,
        balance: account.balance,
        account_type: account.account_type,
        user_id: account.user_id
      },
      movements,
      movementsCount: movements.length
    });

  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error al obtener movimientos de la cuenta',
      error: error.message
    });
  }
};
// Admin: Ver cuentas ordenadas por saldo
export const getAccountsByBalance = async (req, res) => {
  try {
    const { order = 'desc' } = req.query; // 'asc' o 'desc'
    
    const sortOrder = order === 'asc' ? 1 : -1;

    const accounts = await Account.find()
      .sort({ balance: sortOrder });

    res.json({
      success: true,
      count: accounts.length,
      accounts
    });

  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error al obtener cuentas',
      error: error.message
    });
  }
};

// Admin: Ver todas las cuentas
export const getAllAccounts = async (req, res) => {
  try {
    const accounts = await Account.find();

    res.json({
      success: true,
      count: accounts.length,
      accounts
    });

  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error al obtener cuentas',
      error: error.message
    });
  }
};

// Cliente: Editar cuenta (solo tipo si no hay transacciones)
export const updateAccount = async (req, res) => {
  try {
    const userId = req.user.id;
    const { account_type } = req.body;

    const account = await Account.findOne({ user_id: userId });
    
    if (!account) {
      return res.status(404).json({
        success: false,
        message: 'Cuenta no encontrada'
      });
    }

    // Verificar si hay transacciones
    const hasTransactions = await Transaction.findOne({
      $or: [
        { from_account: account.account_number },
        { to_account: account.account_number }
      ]
    });

    if (hasTransactions) {
      return res.status(400).json({
        success: false,
        message: 'No se puede cambiar el tipo de cuenta si ya tiene transacciones'
      });
    }

    account.account_type = account_type;
    await account.save();

    res.json({
      success: true,
      message: 'Tipo de cuenta actualizado',
      account
    });

  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error al actualizar cuenta',
      error: error.message
    });
  }
};