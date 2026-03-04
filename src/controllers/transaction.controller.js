import Transaction from '../models/transaction.model.js';
import Account from '../models/account.model.js';
import mongoose from 'mongoose';

// Tasa de cambio GTQ a USD (configurable)
const EXCHANGE_RATE = {
  GTQ_TO_USD: 7.8, // 1 USD = 7.8 GTQ
  USD_TO_GTQ: 7.8
};

// Obtener historial de transacciones con paginación y filtros avanzados
export const getMyTransactions = async (req, res) => {
  try {
    const userId = req.user.id;
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const skip = (page - 1) * limit;
    const sortBy = req.query.sortBy || 'date'; // date, amount, type
    const order = req.query.order === 'asc' ? 1 : -1;

    // Buscar las cuentas del usuario
    const accounts = await Account.find({ user_id: userId });
    const accountIds = accounts.map(acc => acc._id);
    const accountNumbers = accounts.map(acc => acc.account_number);

    // Filtros opcionales
    const filter = {
      $or: [
        { account_id: { $in: accountIds } },
        { from_account: { $in: accountNumbers } },
        { to_account: { $in: accountNumbers } }
      ]
    };

    // Filtro por tipo de transacción
    if (req.query.type) {
      filter.transaction_type = req.query.type;
    }

    // Filtro por método de pago
    if (req.query.method) {
      filter.transaction_method_payment = req.query.method;
    }

    // Filtro por rango de fechas
    if (req.query.from_date && req.query.to_date) {
      filter.createdAt = {
        $gte: new Date(req.query.from_date),
        $lte: new Date(req.query.to_date)
      };
    }

    // Filtro por rango de monto
    if (req.query.min_amount || req.query.max_amount) {
      filter.transaction_amount = {};
      if (req.query.min_amount) {
        filter.transaction_amount.$gte = parseFloat(req.query.min_amount);
      }
      if (req.query.max_amount) {
        filter.transaction_amount.$lte = parseFloat(req.query.max_amount);
      }
    }

    // Filtro por descripción
    if (req.query.search) {
      filter.transaction_name = { $regex: req.query.search, $options: 'i' };
    }

    // Determinar ordenamiento
    let sortObj = { createdAt: -1 };
    if (sortBy === 'amount') {
      sortObj = { transaction_amount: order };
    } else if (sortBy === 'type') {
      sortObj = { transaction_type: order };
    }

    const total = await Transaction.countDocuments(filter);
    const transactions = await Transaction.find(filter)
      .sort(sortObj)
      .skip(skip)
      .limit(limit)
      .populate('account_id');

    // Calcular resumen de transacciones
    const allTransactions = await Transaction.find(filter).select('transaction_amount transaction_type');
    let typesSummary = {};
    let totalAmount = 0;

    allTransactions.forEach(tx => {
      totalAmount += tx.transaction_amount || 0;
      const type = tx.transaction_type;
      if (!typesSummary[type]) {
        typesSummary[type] = { count: 0, total: 0 };
      }
      typesSummary[type].count++;
      typesSummary[type].total += tx.transaction_amount || 0;
    });

    res.json({
      success: true,
      transactions,
      summary: {
        total_transactions: total,
        total_amount: totalAmount,
        by_type: typesSummary
      },
      pagination: {
        total,
        page,
        pages: Math.ceil(total / limit),
        limit
      }
    });

  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error al obtener transacciones',
      error: error.message
    });
  }
};

// Obtener TODAS las transacciones del usuario (sin paginación)
export const getAllMyTransactions = async (req, res) => {
  try {
    const userId = req.user.id;

    // Buscar las cuentas del usuario
    const accounts = await Account.find({ user_id: userId });
    const accountIds = accounts.map(acc => acc._id);
    const accountNumbers = accounts.map(acc => acc.account_number);

    // Filtro por cuentas del usuario
    const filter = {
      $or: [
        { account_id: { $in: accountIds } },
        { from_account: { $in: accountNumbers } },
        { to_account: { $in: accountNumbers } }
      ]
    };

    // Filtros opcionales
    if (req.query.type) {
      filter.transaction_type = req.query.type;
    }

    if (req.query.method) {
      filter.transaction_method_payment = req.query.method;
    }

    if (req.query.from_date && req.query.to_date) {
      filter.createdAt = {
        $gte: new Date(req.query.from_date),
        $lte: new Date(req.query.to_date)
      };
    }

    if (req.query.min_amount || req.query.max_amount) {
      filter.transaction_amount = {};
      if (req.query.min_amount) {
        filter.transaction_amount.$gte = parseFloat(req.query.min_amount);
      }
      if (req.query.max_amount) {
        filter.transaction_amount.$lte = parseFloat(req.query.max_amount);
      }
    }

    if (req.query.search) {
      filter.transaction_name = { $regex: req.query.search, $options: 'i' };
    }

    // Obtener todas las transacciones ordenadas por fecha descendente
    const allTransactions = await Transaction.find(filter)
      .sort({ createdAt: -1 })
      .populate('account_id');

    // Calcular resumen
    let typesSummary = {};
    let totalAmount = 0;
    let methodsSummary = {};

    allTransactions.forEach(tx => {
      totalAmount += tx.transaction_amount || 0;
      
      const type = tx.transaction_type;
      if (!typesSummary[type]) {
        typesSummary[type] = { count: 0, total: 0 };
      }
      typesSummary[type].count++;
      typesSummary[type].total += tx.transaction_amount || 0;

      const method = tx.transaction_method_payment;
      if (!methodsSummary[method]) {
        methodsSummary[method] = { count: 0, total: 0 };
      }
      methodsSummary[method].count++;
      methodsSummary[method].total += tx.transaction_amount || 0;
    });

    res.json({
      success: true,
      total_records: allTransactions.length,
      transactions: allTransactions,
      summary: {
        total_transactions: allTransactions.length,
        total_amount: totalAmount,
        by_type: typesSummary,
        by_method: methodsSummary
      }
    });

  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error al obtener todas las transacciones',
      error: error.message
    });
  }
};

// Obtener una transacción específica
export const getTransactionById = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user.id;

    // Validar que el ID sea un ObjectId válido
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({
        success: false,
        message: 'ID de transacción inválido'
      });
    }

    const transaction = await Transaction.findById(id).populate('account_id');

    if (!transaction) {
      return res.status(404).json({
        success: false,
        message: 'Transacción no encontrada'
      });
    }

    // Verificar que la transacción pertenece al usuario
    const txUserId = transaction.user_id?.toString ? transaction.user_id.toString() : transaction.user_id;
    if (txUserId !== userId) {
      return res.status(403).json({
        success: false,
        message: 'No tienes permiso para ver esta transacción'
      });
    }

    res.json({
      success: true,
      transaction
    });

  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error al obtener transacción',
      error: error.message
    });
  }
};

// Admin: Obtener todas las transacciones con paginación
export const getAllTransactions = async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 20;
    const skip = (page - 1) * limit;

    const filter = {};
    
    if (req.query.type) {
      filter.transaction_type = req.query.type;
    }

    if (req.query.user_id) {
      filter.user_id = req.query.user_id;
    }

    if (req.query.from_date && req.query.to_date) {
      filter.createdAt = {
        $gte: new Date(req.query.from_date),
        $lte: new Date(req.query.to_date)
      };
    }

    const total = await Transaction.countDocuments(filter);
    const transactions = await Transaction.find(filter)
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit)
      .populate('account_id');

    res.json({
      success: true,
      transactions,
      pagination: {
        total,
        page,
        pages: Math.ceil(total / limit),
        limit
      }
    });

  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error al obtener transacciones',
      error: error.message
    });
  }
};

export const transfer = async (req, res) => {
  const session = await mongoose.startSession();
  session.startTransaction();

  try {
    const { toAccount, amount } = req.body;
    const fromUserId = req.user.id;

    if (!amount || amount <= 0)
      return res.status(400).json({ message: 'Monto inválido' });

    const fromAccount = await Account.findOne({ user_id: fromUserId }).session(session);
    if (!fromAccount)
      return res.status(404).json({ message: 'Cuenta origen no existe' });

    const toAccountData = await Account.findOne({ account_number: toAccount }).session(session);
    if (!toAccountData)
      return res.status(404).json({ message: 'Cuenta destino no existe' });

    if (toAccountData.user_id.toString() === fromUserId)
      return res.status(400).json({ message: 'No puedes transferirte a tu propia cuenta' });

    if (fromAccount.estado !== 'ACTIVA' || toAccountData.estado !== 'ACTIVA')
      return res.status(400).json({ message: 'Cuenta no activa' });

    if (amount > fromAccount.single_transfer_limit)
      return res.status(400).json({ message: 'Límite por transferencia excedido' });

    if (fromAccount.balance < amount)
      return res.status(400).json({ message: 'Saldo insuficiente' });

    // Determinar si hay conversión de moneda
    let debitAmount = amount;
    let creditAmount = amount;
    let exchangeUsed = null;
    let conversionNote = '';

    if (fromAccount.currency !== toAccountData.currency) {
      // Hay conversión de moneda
      if (fromAccount.currency === 'GTQ' && toAccountData.currency === 'USD') {
        // Convertir de GTQ a USD
        creditAmount = parseFloat((amount / EXCHANGE_RATE.GTQ_TO_USD).toFixed(2));
        exchangeUsed = EXCHANGE_RATE.GTQ_TO_USD;
        conversionNote = `Transferencia de GTQ ${amount} a USD ${creditAmount} (Tasa: ${EXCHANGE_RATE.GTQ_TO_USD})`;
      } else if (fromAccount.currency === 'USD' && toAccountData.currency === 'GTQ') {
        // Convertir de USD a GTQ
        creditAmount = parseFloat((amount * EXCHANGE_RATE.USD_TO_GTQ).toFixed(2));
        exchangeUsed = EXCHANGE_RATE.USD_TO_GTQ;
        conversionNote = `Transferencia de USD ${amount} a GTQ ${creditAmount} (Tasa: ${EXCHANGE_RATE.USD_TO_GTQ})`;
      }
    }

    // Realizar la transferencia
    fromAccount.balance -= debitAmount;
    toAccountData.balance += creditAmount;

    await fromAccount.save({ session });
    await toAccountData.save({ session });

    // Crear transacción de débito
    const debit = new Transaction({
      transaction_name: conversionNote || 'Transferencia enviada',
      transaction_amount: debitAmount,
      transaction_type: 'DEBITO',
      transaction_method_payment: 'TRANSFERENCIA',
      account_id: fromAccount._id,
      user_id: fromAccount.user_id,
      from_account: fromAccount.account_number,
      to_account: toAccount,
      exchange_rate: exchangeUsed,
      currency_from: fromAccount.currency,
      currency_to: toAccountData.currency
    });

    // Crear transacción de crédito
    const credit = new Transaction({
      transaction_name: conversionNote || 'Transferencia recibida',
      transaction_amount: creditAmount,
      transaction_type: 'CREDITO',
      transaction_method_payment: 'TRANSFERENCIA',
      account_id: toAccountData._id,
      user_id: toAccountData.user_id,
      from_account: fromAccount.account_number,
      to_account: toAccount,
      exchange_rate: exchangeUsed,
      currency_from: fromAccount.currency,
      currency_to: toAccountData.currency
    });

    await debit.save({ session });
    await credit.save({ session });

    await session.commitTransaction();
    session.endSession();

    res.json({
      success: true,
      message: 'Transferencia realizada',
      data: {
        from_account: fromAccount.account_number,
        to_account: toAccount,
        amount_debited: debitAmount,
        amount_credited: creditAmount,
        from_currency: fromAccount.currency,
        to_currency: toAccountData.currency,
        exchange_rate: exchangeUsed,
        conversion_note: conversionNote || 'Sin conversión'
      }
    });

  } catch (error) {
    await session.abortTransaction();
    session.endSession();
    res.status(500).json({ message: 'Error en transferencia', error: error.message });
  }
};