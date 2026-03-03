import mongoose from 'mongoose';
import Account from '../models/account.model.js';
import Transaction from '../models/transaction.model.js';
import { Roles } from '../constants/roles.js';

export const createDeposit = async (req, res) => {
  try {
    const { accountNumber, amount, description } = req.body;
    const userId = req.user.id; // Obtener userId del token JWT

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

    // Validar que la cuenta pertenece al usuario autenticado (permitir a Admins)
    if (req.user.role !== Roles.ADMIN) {
      if (account.user_id.toString() !== userId) {
        return res.status(403).json({ success: false, message: 'No tienes permiso para depositar en esta cuenta' });
      }
    }

    if (account.estado !== 'ACTIVA')
      return res.status(400).json({ success: false, message: 'Cuenta no activa' });

    // Límite de depósito diario (ejemplo 10,000 por día)
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const depositsToday = await Transaction.aggregate([
      { $match: { account_id: account._id, transaction_type: 'DEPOSITO', createdAt: { $gte: today } } },
      { $group: { _id: null, total: { $sum: '$transaction_amount' } } }
    ]);

    const totalDeposited = depositsToday[0]?.total || 0;
    if (totalDeposited + amount > 10000) {
      return res.status(400).json({ success: false, message: 'Se excede el límite diario de depósitos' });
    }

    // Crear transacción
    const transaction = new Transaction({
      transaction_name: description || 'Depósito',
      transaction_amount: amount,
      transaction_type: 'DEPOSITO',
      account_id: account._id,
      user_id: userId,
      revertible: true
    });
    await transaction.save();

    // Actualizar saldo
    account.balance += amount;
    await account.save();

    res.status(201).json({
      success: true,
      message: 'Depósito realizado exitosamente',
      transaction,
      balance: account.balance
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