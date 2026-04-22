import mongoose from 'mongoose';
import Account from '../models/account.model.js';
import Transaction from '../models/transaction.model.js';
import { Roles } from '../constants/roles.js';

// Tasa de cambio GTQ a USD (configurable)
const EXCHANGE_RATE = {
  GTQ_TO_USD: 7.8, // 1 USD = 7.8 GTQ
  USD_TO_GTQ: 7.8
};

export const createDeposit = async (req, res) => {
  try {
    const { accountNumber, amount, description, currency } = req.body;

    if (!amount || amount <= 0)
      return res.status(400).json({ success: false, message: 'Monto inválido' });

    if (!accountNumber || !amount) {
      return res.status(400).json({ success: false, message: 'Faltan datos obligatorios' });
    }

    if (amount <= 0) {
      return res.status(400).json({ success: false, message: 'El monto debe ser mayor a 0' });
    }

    // Buscar la cuenta
    const account = await Account.findOne({ account_number: accountNumber });
    if (!account) return res.status(404).json({ success: false, message: 'Cuenta no encontrada' });

    // Validar que la moneda coincida o sea compatible
    const currencyToUse = currency || account.currency;
    if (currencyToUse !== 'GTQ' && currencyToUse !== 'USD') {
      return res.status(400).json({ success: false, message: 'Moneda debe ser GTQ o USD' });
    }

    if (account.estado !== 'ACTIVA')
      return res.status(400).json({ success: false, message: 'Cuenta no activa' });

    // Determinar monto a depositar con conversión de moneda
    let depositAmount = amount;
    let exchangeUsed = null;
    let conversionNote = '';

    if (currencyToUse !== account.currency) {
      // Hay conversión de moneda
      if (currencyToUse === 'GTQ' && account.currency === 'USD') {
        // Convertir de GTQ a USD
        depositAmount = parseFloat((amount / EXCHANGE_RATE.GTQ_TO_USD).toFixed(2));
        exchangeUsed = EXCHANGE_RATE.GTQ_TO_USD;
        conversionNote = `Depósito de GTQ ${amount} convertido a USD ${depositAmount} (Tasa: ${EXCHANGE_RATE.GTQ_TO_USD})`;
      } else if (currencyToUse === 'USD' && account.currency === 'GTQ') {
        // Convertir de USD a GTQ
        depositAmount = parseFloat((amount * EXCHANGE_RATE.USD_TO_GTQ).toFixed(2));
        exchangeUsed = EXCHANGE_RATE.USD_TO_GTQ;
        conversionNote = `Depósito de USD ${amount} convertido a GTQ ${depositAmount} (Tasa: ${EXCHANGE_RATE.USD_TO_GTQ})`;
      }
    }

    // Límite de depósito diario (ejemplo 10,000 por día)
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const depositsToday = await Transaction.aggregate([
      { $match: { account_id: account._id, transaction_type: 'DEPOSITO', createdAt: { $gte: today } } },
      { $group: { _id: null, total: { $sum: '$transaction_amount' } } }
    ]);

    const totalDeposited = depositsToday[0]?.total || 0;
    if (totalDeposited + depositAmount > 10000) {
      return res.status(400).json({ success: false, message: 'Se excede el límite diario de depósitos' });
    }

    // Crear transacción
    const transaction = new Transaction({
      transaction_name: conversionNote || description || 'Depósito',
      transaction_amount: depositAmount,
      transaction_type: 'DEPOSITO',
      transaction_method_payment: 'DEPOSITO',
      account_id: account._id,
      user_id: account.user_id,
      revertible: true,
      currency_from: currencyToUse,
      currency_to: account.currency,
      exchange_rate: exchangeUsed
    });
    await transaction.save();

    // Actualizar saldo
    account.balance += depositAmount;
    await account.save();

    res.status(201).json({
      success: true,
      message: 'Depósito realizado exitosamente',
      data: {
        transaction_id: transaction._id,
        account_number: account.account_number,
        amount_deposited: amount,
        amount_credited: depositAmount,
        currency_from: currencyToUse,
        currency_to: account.currency,
        exchange_rate: exchangeUsed,
        description: description || 'Depósito',
        new_balance: account.balance,
        conversion_note: conversionNote || 'Sin conversión',
        timestamp: transaction.createdAt
      }
    });

  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: 'Error al realizar depósito', error: error.message });
  }
};

// Reversión de depósito
export const revertDeposit = async (req, res) => {
  try {
    const { transactionId } = req.body;
    const transaction = await Transaction.findById(transactionId);
    if (!transaction) return res.status(404).json({ success: false, message: 'Transacción no encontrada' });

    if (transaction.transaction_type !== 'DEPOSITO') {
      return res.status(400).json({ success: false, message: 'Solo depósitos pueden revertirse' });
    }

    if (transaction.reverted) {
      return res.status(400).json({ success: false, message: 'Depósito ya fue revertido' });
    }

    const now = new Date();
    const diff = (now - transaction.createdAt) / 1000;
    if (diff > 60) return res.status(400).json({ success: false, message: 'Solo depósitos menores a 1 minuto pueden revertirse' });

    // Restar del saldo
    const account = await Account.findById(transaction.account_id);
    account.balance -= transaction.transaction_amount;
    await account.save();

    // Marcar transacción como revertida
    transaction.reverted = true;
    transaction.revertible = false;
    await transaction.save();

    res.status(200).json({ success: true, message: 'Depósito revertido exitosamente', balance: account.balance });

  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: 'Error al revertir depósito', error: error.message });
  }
};

// Admin: Ver depósitos revertibles (menores a 1 minuto)
export const getPendingDeposits = async (req, res) => {
  try {
    const now = new Date();
    const oneMinuteAgo = new Date(now.getTime() - 60000); // 1 minuto atrás

    const deposits = await Transaction.find({
      transaction_type: 'DEPOSITO',
      revertible: true,
      reverted: false,
      createdAt: { $gte: oneMinuteAgo }
    })
    .populate('account_id')
    .sort({ createdAt: -1 });

    // Calcular tiempo restante para revertir cada depósito
    const depositsWithTime = deposits.map(deposit => {
      const elapsed = (now - deposit.createdAt) / 1000; // segundos
      const remaining = Math.max(0, 60 - elapsed); // segundos restantes
      
      return {
        ...deposit.toObject(),
        secondsRemaining: Math.floor(remaining),
        canRevert: remaining > 0
      };
    });

    res.json({
      success: true,
      count: depositsWithTime.length,
      deposits: depositsWithTime
    });

  } catch (error) {
    console.error(error);
    res.status(500).json({
      success: false,
      message: 'Error al obtener depósitos pendientes',
      error: error.message
    });
  }
};

// Admin: Modificar monto de un depósito existente
export const updateDeposit = async (req, res) => {
  try {
    const { id } = req.params;
    const { amount } = req.body;

    // Validar id
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ success: false, message: 'ID de transacción inválido' });
    }

    // Validar monto
    const newAmount = parseFloat(amount);
    if (isNaN(newAmount) || newAmount <= 0) {
      return res.status(400).json({ success: false, message: 'Monto inválido' });
    }

    const transaction = await Transaction.findById(id);
    if (!transaction) return res.status(404).json({ success: false, message: 'Transacción no encontrada' });

    if (transaction.transaction_type !== 'DEPOSITO') {
      return res.status(400).json({ success: false, message: 'Solo depósitos pueden modificarse' });
    }

    if (transaction.reverted) {
      return res.status(400).json({ success: false, message: 'No se puede modificar un depósito revertido' });
    }

    // Obtener cuenta
    const account = await Account.findById(transaction.account_id);
    if (!account) return res.status(404).json({ success: false, message: 'Cuenta asociada no encontrada' });

    // Calcular diferencia y aplicar al saldo
    const diff = newAmount - transaction.transaction_amount;
    transaction.transaction_amount = newAmount;
    transaction.updatedAt = new Date();
    await transaction.save();

    account.balance += diff;
    await account.save();

    return res.status(200).json({ success: true, message: 'Depósito modificado correctamente', transaction, balance: account.balance });

  } catch (error) {
    console.error(error);
    return res.status(500).json({ success: false, message: 'Error al modificar depósito', error: error.message });
  }
};