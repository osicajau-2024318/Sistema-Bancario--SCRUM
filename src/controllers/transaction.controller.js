import Transaction from '../models/transaction.model.js';
import Account from '../models/account.model.js';
import mongoose from 'mongoose';

const HISTORY_TYPES = ['DEPOSITO', 'DEBITO', 'CREDITO', 'TRANSFERENCIA'];

export const getHistoryMe = async (req, res) => {
  try {
    const userId = req.user.id;
    const accounts = await Account.find({ user_id: userId });
    const accountIds = accounts.map(acc => acc._id);
    const accountNumbers = accounts.map(acc => acc.account_number);
    const filter = {
      transaction_type: { $in: HISTORY_TYPES },
      $or: [
        { account_id: { $in: accountIds } },
        { from_account: { $in: accountNumbers } },
        { to_account: { $in: accountNumbers } }
      ]
    };
    const history = await Transaction.find(filter)
      .sort({ createdAt: -1 })
      .populate('account_id', 'account_number account_type currency')
      .lean();
    res.json({ success: true, total_records: history.length, history });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Error al obtener historial', error: error.message });
  }
};

export const getHistoryByAccountId = async (req, res) => {
  try {
    const { accountId } = req.params;
    if (!mongoose.Types.ObjectId.isValid(accountId)) {
      return res.status(400).json({ success: false, message: 'ID de cuenta inválido' });
    }
    const account = await Account.findById(accountId);
    if (!account) {
      return res.status(404).json({ success: false, message: 'Cuenta no encontrada' });
    }
    const filter = {
      transaction_type: { $in: HISTORY_TYPES },
      $or: [
        { account_id: account._id },
        { from_account: account.account_number },
        { to_account: account.account_number }
      ]
    };
    const history = await Transaction.find(filter)
      .sort({ createdAt: -1 })
      .populate('account_id', 'account_number account_type currency')
      .lean();
    res.json({
      success: true,
      accountId: account._id,
      account_number: account.account_number,
      total_records: history.length,
      history
    });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Error al obtener historial de la cuenta', error: error.message });
  }
};

export const getMyTransactions = async (req, res) => {
  try {
    const userId = req.user.id;
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const skip = (page - 1) * limit;
    const sortBy = req.query.sortBy || 'date';
    const order = req.query.order === 'asc' ? 1 : -1;
    const accounts = await Account.find({ user_id: userId });
    const accountIds = accounts.map(acc => acc._id);
    const accountNumbers = accounts.map(acc => acc.account_number);
    const filter = {
      $or: [
        { account_id: { $in: accountIds } },
        { from_account: { $in: accountNumbers } },
        { to_account: { $in: accountNumbers } }
      ]
    };
    if (req.query.type) filter.transaction_type = req.query.type;
    if (req.query.method) filter.transaction_method_payment = req.query.method;
    if (req.query.from_date && req.query.to_date) {
      filter.createdAt = { $gte: new Date(req.query.from_date), $lte: new Date(req.query.to_date) };
    }
    if (req.query.min_amount || req.query.max_amount) {
      filter.transaction_amount = {};
      if (req.query.min_amount) filter.transaction_amount.$gte = parseFloat(req.query.min_amount);
      if (req.query.max_amount) filter.transaction_amount.$lte = parseFloat(req.query.max_amount);
    }
    if (req.query.search) filter.transaction_name = { $regex: req.query.search, $options: 'i' };
    let sortObj = { createdAt: -1 };
    if (sortBy === 'amount') sortObj = { transaction_amount: order };
    else if (sortBy === 'type') sortObj = { transaction_type: order };
    const total = await Transaction.countDocuments(filter);
    const transactions = await Transaction.find(filter).sort(sortObj).skip(skip).limit(limit).populate('account_id');
    const allForSummary = await Transaction.find(filter).select('transaction_amount transaction_type');
    let typesSummary = {};
    let totalAmount = 0;
    allForSummary.forEach(tx => {
      totalAmount += tx.transaction_amount || 0;
      const type = tx.transaction_type;
      if (!typesSummary[type]) typesSummary[type] = { count: 0, total: 0 };
      typesSummary[type].count++;
      typesSummary[type].total += tx.transaction_amount || 0;
    });
    res.json({
      success: true,
      transactions,
      summary: { total_transactions: total, total_amount: totalAmount, by_type: typesSummary },
      pagination: { total, page, pages: Math.ceil(total / limit), limit }
    });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Error al obtener transacciones', error: error.message });
  }
};

export const getTransactionById = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user.id;
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ success: false, message: 'ID de transacción inválido' });
    }
    const transaction = await Transaction.findById(id).populate('account_id');
    if (!transaction) {
      return res.status(404).json({ success: false, message: 'Transacción no encontrada' });
    }
    const txUserId = transaction.user_id?.toString ? transaction.user_id.toString() : transaction.user_id;
    if (txUserId !== userId) {
      return res.status(403).json({ success: false, message: 'No tienes permiso para ver esta transacción' });
    }
    res.json({ success: true, transaction });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Error al obtener transacción', error: error.message });
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
