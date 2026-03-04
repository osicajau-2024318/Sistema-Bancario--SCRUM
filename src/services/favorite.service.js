import Favorite from '../models/favorite.model.js';
import Account from '../models/account.model.js';
import Transaction from '../models/transaction.model.js';
import mongoose from 'mongoose';

// Transferencia rápida desde favorito
export const transferFromFavorite = async (id, amount, fromUserId) => {
  try {
    // Validar monto
    if (!amount || amount <= 0) {
      throw new Error('Monto inválido');
    }

    // Obtener el favorito
    const favorite = await Favorite.findById(id);
    if (!favorite) {
      throw new Error('Favorito no encontrado');
    }

    // Verificar que el favorito pertenece al usuario
    if (favorite.owner_user_id !== fromUserId) {
      throw new Error('No tienes permiso para usar este favorito');
    }

    // Obtener cuenta origen
    const fromAccount = await Account.findOne({ user_id: fromUserId });
    if (!fromAccount) {
      throw new Error('Cuenta origen no existe');
    }

    // Obtener cuenta destino usando el número de cuenta del favorito
    const toAccountData = await Account.findOne({ 
      account_number: favorite.account_number 
    });
    
    if (!toAccountData) {
      throw new Error('Cuenta destino no existe');
    }

    // No permitir transferir a propia cuenta
    if (toAccountData.user_id.toString() === fromUserId) {
      throw new Error('No puedes transferirte a tu propia cuenta');
    }

    // Validar que ambas cuentas estén activas
    if (fromAccount.estado !== 'ACTIVA' || toAccountData.estado !== 'ACTIVA') {
      throw new Error('Cuenta no activa');
    }

    // Validar límite de transferencia
    if (amount > fromAccount.single_transfer_limit) {
      throw new Error('Límite por transferencia excedido');
    }

    // Validar saldo
    if (fromAccount.balance < amount) {
      throw new Error('Saldo insuficiente');
    }

    // Realizar transferencia
    fromAccount.balance -= amount;
    toAccountData.balance += amount;

    await fromAccount.save();
    await toAccountData.save();

    // Crear transacciones
    const debit = new Transaction({
      transaction_name: `Transferencia enviada a ${favorite.alias}`,
      transaction_amount: amount,
      transaction_type: 'DEBITO',
      transaction_method_payment: 'TRANSFERENCIA',
      account_id: fromAccount._id,
      user_id: fromAccount.user_id
    });

    const credit = new Transaction({
      transaction_name: 'Transferencia recibida',
      transaction_amount: amount,
      transaction_type: 'CREDITO',
      transaction_method_payment: 'TRANSFERENCIA',
      account_id: toAccountData._id,
      user_id: toAccountData.user_id
    });

    await debit.save();
    await credit.save();

    return {
      success: true,
      message: 'Transferencia rápida realizada',
      data: {
        from_account: fromAccount.account_number,
        to_account: toAccountData.account_number,
        to_alias: favorite.alias,
        amount
      }
    };

  } catch (error) {
    throw error;
  }
};
