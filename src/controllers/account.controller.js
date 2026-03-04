import mongoose from 'mongoose';
import Account from '../models/account.model.js';
import { convertCurrency } from '../services/currency.service.js';
import { verifyUserExists, verifyMonthlyIncome, createClientInAuthService } from '../services/authService.service.js';
import Transaction from '../models/transaction.model.js';
import axios from 'axios';

// Tasa de cambio GTQ a USD (configurable)
const EXCHANGE_RATE = {
  GTQ_TO_USD: 7.8, // 1 USD = 7.8 GTQ
  USD_TO_GTQ: 7.8
};

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


// ─── ADMIN: Crear cuenta para cualquier usuario por userId ───
export const createAccount = async (req, res) => {
  try {
    if (!req.body || Object.keys(req.body).length === 0) {
      return res.status(400).json({ success: false, message: 'Se requiere account_type, currency y opcionalmente balance ' });
    }

    const { userId, account_type, currency, balance } = req.body;
    const targetUserId = userId || req.user.id;

    if (!account_type || !['AHORRO', 'CORRIENTE', 'NOMINA'].includes(account_type)) {
      return res.status(400).json({ success: false, message: 'Tipo de cuenta inválido. Use AHORRO, CORRIENTE o NOMINA' });
    }

    if (!currency || !['GTQ', 'USD'].includes(currency)) {
      return res.status(400).json({ success: false, message: 'Moneda inválida. Use GTQ o USD' });
    }

    const initialBalance = parseFloat(balance) || 0;
    if (initialBalance < 0) {
      return res.status(400).json({ success: false, message: 'El saldo inicial no puede ser negativo' });
    }

    // Verificar que el usuario existe en .NET — usa targetUserId
    const token = req.headers.authorization?.split(' ')[1];
    try {
      await verifyUserExists(targetUserId, token);
    } catch (error) {
      return res.status(404).json({ success: false, message: 'Usuario no encontrado en el sistema' });
    }

    // Generar número de cuenta único
    let account_number;
    let exists = true;
    while (exists) {
      account_number = Math.floor(1000000000 + Math.random() * 9000000000).toString();
      exists = await Account.findOne({ account_number });
    }

    const account = new Account({
      user_id: targetUserId,
      account_type,
      currency,
      balance: initialBalance,
      account_number,
      estado: 'ACTIVA'
    });

    await account.save();

    res.status(201).json({
      success: true,
      message: 'Cuenta creada exitosamente',
      account
    });

  } catch (error) {
    res.status(500).json({ success: false, message: 'Error al crear cuenta', error: error.message });
  }
};

// ─── USUARIO: Crear su propia cuenta (queda PENDIENTE hasta que admin active) ───
export const createMyAccount = async (req, res) => {
  try {
    const userId = req.user.id;
    let { account_type, currency, balance } = req.body;

   

    const initialBalance = parseFloat(balance) || 0;
    if (initialBalance < 0) {
      return res.status(400).json({ success: false, message: 'El saldo inicial no puede ser negativo' });
    }

    if (!['AHORRO', 'CORRIENTE', 'NOMINA'].includes(account_type)) {
      return res.status(400).json({ success: false, message: 'Tipo de cuenta inválido. Use AHORRO, CORRIENTE o NOMINA' });
    }

    if (!['GTQ', 'USD'].includes(currency)) {
      return res.status(400).json({ success: false, message: 'Moneda inválida. Use GTQ o USD' });
    }

    // Generar número de cuenta único
    let account_number;
    let exists = true;
    while (exists) {
      account_number = Math.floor(1000000000 + Math.random() * 9000000000).toString();
      exists = await Account.findOne({ account_number });
    }

    const account = new Account({
      user_id: userId,
      account_type,
      currency,
      balance: initialBalance,
      account_number,
      estado: 'PENDIENTE' // Queda pendiente hasta que admin active
    });

    await account.save();

    res.status(201).json({
      success: true,
      message: 'Cuenta creada. Pendiente de activación por un administrador.',
      account
    });

  } catch (error) {
    res.status(500).json({ success: false, message: 'Error al crear cuenta', error: error.message });
  }
};


// ─── ADMIN: Activar cuenta de un usuario ───
export const activateAccount = async (req, res) => {
  try {
    const { accountId } = req.params;

    const account = await Account.findById(accountId);
    if (!account) {
      return res.status(404).json({ success: false, message: 'Cuenta no encontrada' });
    }

    if (account.estado === 'ACTIVA') {
      return res.status(400).json({ success: false, message: 'La cuenta ya está activa' });
    }

    account.estado = 'ACTIVA';
    await account.save();

    res.json({
      success: true,
      message: 'Cuenta activada correctamente',
      account
    });

  } catch (error) {
    res.status(500).json({ success: false, message: 'Error al activar cuenta', error: error.message });
  }
};

// Obtener cuentas del usuario
export const getMyAccount = async (req, res) => {
  try {
    const userId = req.user.id;
    const accounts = await Account.find({ user_id: userId });

    if (!accounts || accounts.length === 0) {
      return res.status(404).json({ 
        success: false, 
        message: 'No tienes cuentas bancarias registradas' 
      });
    }

    res.json({ 
      success: true, 
      totalAccounts: accounts.length, 
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

// Transferencia
export const transfer = async (req, res) => {
  try {
    const fromUserId = req.user.id;
    const { toAccount, amount, description, currency } = req.body;

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

    // Determinar moneda de origen
    const currencyFrom = currency || fromAccount.currency;
    if (currencyFrom !== 'GTQ' && currencyFrom !== 'USD') {
      return res.status(400).json({
        success: false,
        message: 'Moneda debe ser GTQ o USD'
      });
    }

    // Verificar límite por transferencia (Q2000 o USD equivalente)
    if (amount > fromAccount.single_transfer_limit) {
      return res.status(400).json({
        success: false,
        message: `Supera el límite por transferencia de ${fromAccount.currency}${fromAccount.single_transfer_limit}`
      });
    }

    // Verificar límite diario (Q10,000 o USD equivalente)
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
        message: `Supera el límite diario de transferencias. Disponible hoy: ${fromAccount.currency}${remaining}`
      });
    }

    // Verificar saldo suficiente
    if (fromAccount.balance < amount) {
      return res.status(400).json({
        success: false,
        message: 'Saldo insuficiente'
      });
    }

    // Realizar la transferencia con conversión de moneda
    let debitAmount = amount;
    let creditAmount = amount;
    let exchangeUsed = null;
    let conversionNote = '';

    // Verificar si hay conversión de moneda
    if (currencyFrom !== toAccountData.currency) {
      if (currencyFrom === 'GTQ' && toAccountData.currency === 'USD') {
        // Convertir de GTQ a USD
        creditAmount = parseFloat((amount / EXCHANGE_RATE.GTQ_TO_USD).toFixed(2));
        exchangeUsed = EXCHANGE_RATE.GTQ_TO_USD;
        conversionNote = `Transferencia de GTQ ${amount} a USD ${creditAmount} (Tasa: ${EXCHANGE_RATE.GTQ_TO_USD})`;
      } else if (currencyFrom === 'USD' && toAccountData.currency === 'GTQ') {
        // Convertir de USD a GTQ
        creditAmount = parseFloat((amount * EXCHANGE_RATE.USD_TO_GTQ).toFixed(2));
        exchangeUsed = EXCHANGE_RATE.USD_TO_GTQ;
        conversionNote = `Transferencia de USD ${amount} a GTQ ${creditAmount} (Tasa: ${EXCHANGE_RATE.USD_TO_GTQ})`;
      }
    }

    fromAccount.balance -= debitAmount;
    toAccountData.balance += creditAmount;

    fromAccount.daily_transferred_amount += debitAmount;

    await fromAccount.save();
    await toAccountData.save();

    // Crear registro de transacción
    const transaction = new Transaction({
      transaction_name: conversionNote || description || 'Transferencia',
      transaction_amount: creditAmount,
      transaction_type: 'TRANSFERENCIA',
      transaction_method_payment: 'TRANSFERENCIA',
      from_account: fromAccount.account_number,
      to_account: toAccountData.account_number,
      account_id: fromAccount._id,
      user_id: fromUserId,
      revertible: false,
      exchange_rate: exchangeUsed,
      currency_from: currencyFrom,
      currency_to: toAccountData.currency
    });

    await transaction.save();

    res.json({
      success: true,
      message: 'Transferencia realizada exitosamente',
      transaction: {
        amount_debited: debitAmount,
        amount_credited: creditAmount,
        from: fromAccount.account_number,
        to: toAccountData.account_number,
        from_currency: currencyFrom,
        to_currency: toAccountData.currency,
        exchange_rate: exchangeUsed,
        conversion_note: conversionNote || 'Sin conversión',
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
    const { order = 'desc' } = req.query;

    const accounts = await Account.find();

    const accountsWithMovements = await Promise.all(
      accounts.map(async (account) => {
        const movementsCount = await Transaction.countDocuments({
          $or: [
            { from_account: account.account_number },
            { to_account: account.account_number },
            { account_id: account._id }
          ],
          transaction_type: { $in: ['TRANSFERENCIA', 'COMPRA', 'CREDITO'] }
        });

        return {
          ...account.toObject(),
          movementsCount
        };
      })
    );

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

// Admin: Editar cuenta por id (actualizaciones parciales). No permite cambiar `balance`.
export const updateAccount = async (req, res) => {
  try {
    const { id } = req.params;

    // Validar formato de ObjectId
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ success: false, message: 'ID de cuenta inválido' });
    }

    // Prohibir cambios en balance
    if (Object.prototype.hasOwnProperty.call(req.body, 'balance')) {
      return res.status(400).json({ success: false, message: 'No está permitido modificar el balance' });
    }

    // Campos permitidos para actualizar
    const allowedFields = ['account_type', 'currency', 'estado', 'account_number', 'single_transfer_limit', 'daily_transfer_limit'];
    const updates = {};

    for (const key of Object.keys(req.body)) {
      if (!allowedFields.includes(key)) {
        return res.status(400).json({ success: false, message: `Campo inválido en la actualización: ${key}` });
      }
      updates[key] = req.body[key];
    }

    if (Object.keys(updates).length === 0) {
      return res.status(400).json({ success: false, message: 'No se proporcionaron campos válidos para actualizar' });
    }

    // Validaciones específicas
    if (updates.account_type && !['AHORRO', 'CORRIENTE', 'NOMINA'].includes(updates.account_type)) {
      return res.status(400).json({ success: false, message: 'Tipo de cuenta inválido. Use AHORRO, CORRIENTE o NOMINA' });
    }

    if (updates.currency && !['GTQ', 'USD'].includes(updates.currency)) {
      return res.status(400).json({ success: false, message: 'Moneda inválida. Use GTQ o USD' });
    }

    const account = await Account.findById(id);
    if (!account) {
      return res.status(404).json({ success: false, message: 'Cuenta no encontrada' });
    }

    // Aplicar actualizaciones parciales
    Object.keys(updates).forEach((k) => { account[k] = updates[k]; });

    await account.save();

    res.json({ success: true, message: 'Cuenta actualizada correctamente', account });

  } catch (error) {
    res.status(500).json({ success: false, message: 'Error al actualizar cuenta', error: error.message });
  }
};

export const registerUser = async (req, res) => {
  try {
    let { name, surname, username, email, password, phone,
          dpi, address, workName, monthlyIncome } = req.body;

    monthlyIncome = parseFloat(monthlyIncome);

    if (!name || !surname || !username || !email || !password || !phone) {
      return res.status(400).json({ success: false, message: 'Faltan campos obligatorios' });
    }

    if (monthlyIncome < 100) {
      return res.status(400).json({ success: false, message: 'Ingresos mensuales deben ser al menos Q100' });
    }

    // Registrar usuario en  queda con Status false (pendiente)
    let result;
    try {
      result = await axios.post(`${process.env.AUTH_SERVICE_URL}/api/v1/auth/register`, {
        name, surname, username, email, password, phone,
        dpi: dpi || '', address: address || '',
        workName: workName || '', monthlyIncome
      });
    } catch (error) {
      return res.status(error.response?.status || 500).json({
        success: false,
        message: error.response?.data?.message || 'Error al registrar usuario',
        details: error.response?.data
      });
    }

    res.status(201).json({
      success: true,
      message: 'Registro exitoso. Tu cuenta está pendiente de activación por un administrador.',
      user: result.data
    });

  } catch (error) {
    res.status(500).json({ success: false, message: 'Error al registrar', error: error.message });
  }
};

export const getMyInfo = async (req, res) => {
  try {
    const userId = req.user.id;
    const token = req.headers.authorization?.split(' ')[1];

    let userInfo = null;
    try {
      const response = await axios.get(
        `${process.env.AUTH_SERVICE_URL}/users/me`,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      userInfo = response.data?.data || response.data;
    } catch (error) {
      return res.status(500).json({
        success: false,
        message: 'Error al obtener información del usuario',
        error: error.response?.data?.message || error.message
      });
    }

    const accounts = await Account.find({ user_id: userId });

    res.json({
      success: true,
      user: userInfo,
      accounts,
      totalAccounts: accounts.length
    });

  } catch (error) {
    res.status(500).json({ 
      success: false, 
      message: 'Error al obtener información', 
      error: error.message 
    });
  }
};