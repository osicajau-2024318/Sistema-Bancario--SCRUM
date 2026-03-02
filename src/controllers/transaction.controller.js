import Transaction from '../models/transaction.model.js';
import Account from '../models/account.model.js';

// Obtener historial de transacciones con paginación
export const getMyTransactions = async (req, res) => {
  try {
    const userId = req.user.id;
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const skip = (page - 1) * limit;

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

    if (req.query.type) {
      filter.transaction_type = req.query.type;
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

// Obtener una transacción específica
export const getTransactionById = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user.id;

    const transaction = await Transaction.findById(id).populate('account_id');

    if (!transaction) {
      return res.status(404).json({
        success: false,
        message: 'Transacción no encontrada'
      });
    }

    // Verificar que la transacción pertenece al usuario
    if (transaction.user_id !== userId) {
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

    fromAccount.balance -= amount;
    toAccountData.balance += amount;

    await fromAccount.save({ session });
    await toAccountData.save({ session });

    const debit = new Transaction({
      transaction_name: 'Transferencia enviada',
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

    res.json({ success: true, message: 'Transferencia realizada' });

  } catch (error) {
    await session.abortTransaction();
    session.endSession();
    res.status(500).json({ message: 'Error en transferencia', error: error.message });
  }
};