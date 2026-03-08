import Favorite from '../models/favorite.model.js';
import Account from '../models/account.model.js';
import Transaction from '../models/transaction.model.js';
import mongoose from 'mongoose';

/**
 * Busca un favorito por ID (ObjectId) o por alias del usuario.
 * Permite usar en la URL el alias (ej. "Mamá") en lugar del _id.
 */
export const findFavoriteByIdOrAlias = async (idOrAlias, ownerUserId) => {
  if (!idOrAlias || String(idOrAlias).trim() === '') return null;
  const value = String(idOrAlias).trim();
  if (mongoose.Types.ObjectId.isValid(value) && value.length === 24) {
    const byId = await Favorite.findOne({ _id: value, owner_user_id: ownerUserId });
    if (byId) return byId;
  }
  return Favorite.findOne({ owner_user_id: ownerUserId, alias: value });
};

/**
 * Transferencia rápida a un favorito.
 * idOrAlias = ID del favorito (ObjectId) o alias (ej. "Mamá"). La cuenta destino se obtiene del favorito.
 */
export const transferFromFavorite = async (idOrAlias, amount, fromUserId, fromAccountNumber) => {
  if (!amount || amount <= 0) {
    throw new Error('Monto inválido');
  }

  if (!fromAccountNumber || String(fromAccountNumber).trim() === '') {
    throw new Error('Debes indicar la cuenta origen (fromAccount): el número de tu cuenta desde la que envías');
  }

  const favorite = await findFavoriteByIdOrAlias(idOrAlias, fromUserId);
  if (!favorite) {
    throw new Error('Favorito no encontrado. Verifica el alias o el ID.');
  }

  const fromAccount = await Account.findOne({
    user_id: fromUserId,
    account_number: String(fromAccountNumber).trim()
  });
  if (!fromAccount) {
    throw new Error('Cuenta origen no encontrada o no te pertenece. Verifica fromAccount.');
  }

  const toAccountData = await Account.findOne({ account_number: favorite.account_number });
  if (!toAccountData) {
    throw new Error('Cuenta destino no existe');
  }

  if (fromAccount.account_number === toAccountData.account_number) {
    throw new Error('No puedes transferir a la misma cuenta');
  }

  if (fromAccount.estado !== 'ACTIVA' || toAccountData.estado !== 'ACTIVA') {
    throw new Error('Cuenta no activa');
  }

  if (amount > fromAccount.single_transfer_limit) {
    throw new Error('Límite por transferencia excedido');
  }

  const today = new Date().toDateString();
  const lastDate = fromAccount.last_transfer_date?.toDateString();
  if (today !== lastDate) {
    fromAccount.daily_transferred_amount = 0;
    fromAccount.last_transfer_date = new Date();
  }
  if (fromAccount.daily_transferred_amount + amount > fromAccount.daily_transfer_limit) {
    const remaining = fromAccount.daily_transfer_limit - fromAccount.daily_transferred_amount;
    throw new Error(`Supera el límite diario de transferencias. Disponible hoy: ${fromAccount.currency}${remaining}`);
  }

  if (fromAccount.balance < amount) {
    throw new Error('Saldo insuficiente');
  }

  fromAccount.balance -= amount;
  toAccountData.balance += amount;
  fromAccount.daily_transferred_amount += amount;

  await fromAccount.save();
  await toAccountData.save();

  const debit = new Transaction({
    transaction_name: `Transferencia rápida a ${favorite.alias}`,
    transaction_amount: amount,
    transaction_type: 'DEBITO',
    transaction_method_payment: 'TRANSFERENCIA',
    account_id: fromAccount._id,
    user_id: fromAccount.user_id,
    from_account: fromAccount.account_number,
    to_account: toAccountData.account_number
  });
  const credit = new Transaction({
    transaction_name: `Transferencia recibida`,
    transaction_amount: amount,
    transaction_type: 'CREDITO',
    transaction_method_payment: 'TRANSFERENCIA',
    account_id: toAccountData._id,
    user_id: toAccountData.user_id,
    from_account: fromAccount.account_number,
    to_account: toAccountData.account_number
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
      amount,
      daily_remaining: fromAccount.daily_transfer_limit - fromAccount.daily_transferred_amount
    }
  };
};
