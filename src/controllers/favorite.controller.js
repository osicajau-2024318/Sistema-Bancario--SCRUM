import Favorite from '../models/favorite.model.js';
import Account from '../models/account.model.js';
import Transaction from '../models/transaction.model.js';
import mongoose from 'mongoose';

// Crear favorito
export const createFavorite = async (req, res) => {
  try {
    const { alias, account_number } = req.body;
    const userId = req.user.id;

    const account = await Account.findOne({ account_number });
    if (!account) {
      return res.status(404).json({ message: 'Cuenta no existe' });
    }

    const exists = await Favorite.findOne({ 
      owner_user_id: userId,
      account_number 
    });

    if (exists) {
      return res.status(400).json({ message: 'Cuenta ya está en favoritos' });
    }

    const favorite = new Favorite({
      alias,
      account_number,
      account_type: account.account_type,
      owner_user_id: userId
    });

    await favorite.save();

    res.status(201).json({
      success: true,
      message: 'Favorito agregado',
      favorite
    });

  } catch (error) {
    res.status(500).json({ message: 'Error al crear favorito', error: error.message });
  }
};

// Obtener mis favoritos
export const getMyFavorites = async (req, res) => {
  const userId = req.user.id;

  const favorites = await Favorite.find({ owner_user_id: userId });

  res.json({
    success: true,
    total: favorites.length,
    favorites
  });
};

// Actualizar alias
export const updateFavorite = async (req, res) => {
  const { id } = req.params;
  const userId = req.user.id;

  const favorite = await Favorite.findOneAndUpdate(
    { _id: id, owner_user_id: userId },
    { alias: req.body.alias },
    { new: true }
  );

  if (!favorite) {
    return res.status(404).json({ message: 'Favorito no encontrado' });
  }

  res.json({
    success: true,
    message: 'Favorito actualizado',
    favorite
  });
};

// Eliminar favorito
export const deleteFavorite = async (req, res) => {
  const { id } = req.params;
  const userId = req.user.id;

  const favorite = await Favorite.findOneAndDelete({ 
    _id: id, 
    owner_user_id: userId 
  });

  if (!favorite) {
    return res.status(404).json({ message: 'Favorito no encontrado' });
  }

  res.json({
    success: true,
    message: 'Favorito eliminado'
  });
};

// Transferencia rápida desde favorito
export const quickTransferFromFavorite = async (req, res) => {
  const session = await mongoose.startSession();
  session.startTransaction();

  try {
    const { id } = req.params;
    const { amount } = req.body;
    const fromUserId = req.user.id;

    // Validar monto
    if (!amount || amount <= 0) {
      await session.abortTransaction();
      session.endSession();
      return res.status(400).json({ message: 'Monto inválido' });
    }

    // Obtener el favorito
    const favorite = await Favorite.findById(id).session(session);
    if (!favorite) {
      await session.abortTransaction();
      session.endSession();
      return res.status(404).json({ message: 'Favorito no encontrado' });
    }

    // Verificar que el favorito pertenece al usuario
    if (favorite.owner_user_id !== fromUserId) {
      await session.abortTransaction();
      session.endSession();
      return res.status(403).json({ message: 'No tienes permiso para usar este favorito' });
    }

    // Obtener cuenta origen
    const fromAccount = await Account.findOne({ user_id: fromUserId }).session(session);
    if (!fromAccount) {
      await session.abortTransaction();
      session.endSession();
      return res.status(404).json({ message: 'Cuenta origen no existe' });
    }

    // Obtener cuenta destino usando el número de cuenta del favorito
    const toAccountData = await Account.findOne({ 
      account_number: favorite.account_number 
    }).session(session);
    
    if (!toAccountData) {
      await session.abortTransaction();
      session.endSession();
      return res.status(404).json({ message: 'Cuenta destino no existe' });
    }

    // No permitir transferir a propia cuenta
    if (toAccountData.user_id.toString() === fromUserId) {
      await session.abortTransaction();
      session.endSession();
      return res.status(400).json({ message: 'No puedes transferirte a tu propia cuenta' });
    }

    // Validar que ambas cuentas estén activas
    if (fromAccount.estado !== 'ACTIVA' || toAccountData.estado !== 'ACTIVA') {
      await session.abortTransaction();
      session.endSession();
      return res.status(400).json({ message: 'Cuenta no activa' });
    }

    // Validar límite de transferencia
    if (amount > fromAccount.single_transfer_limit) {
      await session.abortTransaction();
      session.endSession();
      return res.status(400).json({ message: 'Límite por transferencia excedido' });
    }

    // Validar saldo
    if (fromAccount.balance < amount) {
      await session.abortTransaction();
      session.endSession();
      return res.status(400).json({ message: 'Saldo insuficiente' });
    }

    // Realizar transferencia
    fromAccount.balance -= amount;
    toAccountData.balance += amount;

    await fromAccount.save({ session });
    await toAccountData.save({ session });

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

    await debit.save({ session });
    await credit.save({ session });

    await session.commitTransaction();
    session.endSession();

    res.json({
      success: true,
      message: 'Transferencia rápida realizada',
      data: {
        from_account: fromAccount.account_number,
        to_account: toAccountData.account_number,
        to_alias: favorite.alias,
        amount
      }
    });

  } catch (error) {
    await session.abortTransaction();
    session.endSession();
    res.status(500).json({ 
      message: 'Error en transferencia rápida', 
      error: error.message 
    });
  }
};