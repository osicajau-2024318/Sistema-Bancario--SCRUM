import Loan from '../models/loan.model.js';

export const getMyLoans = async (req, res) => {
  try {
    const userId = req.user.id;
    const loans = await Loan.find({ user_id: userId }).sort({ createdAt: -1 });

    return res.json({
      success: true,
      total: loans.length,
      loans
    });
  } catch (error) {
    console.error('Error al obtener préstamos:', error);
    return res.status(500).json({
      success: false,
      message: 'Error al obtener tus préstamos',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

export const getAllLoans = async (req, res) => {
  try {
    const page = parseInt(req.query.page, 10) || 1;
    const limit = parseInt(req.query.limit, 10) || 20;
    const skip = (page - 1) * limit;

    const filter = {};
    if (req.query.user_id) filter.user_id = req.query.user_id;
    if (req.query.status) filter.status = req.query.status;

    const total = await Loan.countDocuments(filter);
    const loans = await Loan.find(filter)
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit);

    return res.json({
      success: true,
      count: loans.length,
      loans,
      pagination: {
        total,
        page,
        pages: Math.ceil(total / limit) || 1,
        limit
      }
    });
  } catch (error) {
    console.error('Error al obtener préstamos:', error);
    return res.status(500).json({
      success: false,
      message: 'Error al obtener préstamos',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

export const createLoan = async (req, res) => {
  try {
    const { name, type, principalAmount, outstandingBalance, interestRate, monthlyInstallment, nextPaymentDate, termRemaining, user_id } = req.body;

    if (!user_id) {
      return res.status(400).json({
        success: false,
        message: 'El user_id es requerido'
      });
    }

    const loan = new Loan({
      name,
      type,
      principalAmount,
      outstandingBalance,
      interestRate,
      monthlyInstallment,
      nextPaymentDate,
      termRemaining,
      user_id
    });

    await loan.save();

    return res.status(201).json({
      success: true,
      message: 'Préstamo creado exitosamente',
      loan
    });
  } catch (error) {
    if (error.name === 'ValidationError') {
      return res.status(400).json({ success: false, message: 'Datos inválidos', error: error.message });
    }
    console.error('Error al crear préstamo:', error);
    return res.status(500).json({
      success: false,
      message: 'Error al crear préstamo',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

export const updateLoan = async (req, res) => {
  try {
    const { id } = req.params;
    const updates = req.body;

    const loan = await Loan.findByIdAndUpdate(id, updates, { new: true, runValidators: true });

    if (!loan) {
      return res.status(404).json({
        success: false,
        message: 'Préstamo no encontrado'
      });
    }

    return res.json({
      success: true,
      message: 'Préstamo actualizado exitosamente',
      loan
    });
  } catch (error) {
    if (error.name === 'ValidationError') {
      return res.status(400).json({ success: false, message: 'Datos inválidos', error: error.message });
    }
    if (error.name === 'CastError') {
      return res.status(400).json({ success: false, message: 'ID de préstamo inválido' });
    }
    console.error('Error al actualizar préstamo:', error);
    return res.status(500).json({
      success: false,
      message: 'Error al actualizar préstamo',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

export const deleteLoan = async (req, res) => {
  try {
    const { id } = req.params;

    const loan = await Loan.findByIdAndDelete(id);

    if (!loan) {
      return res.status(404).json({
        success: false,
        message: 'Préstamo no encontrado'
      });
    }

    return res.json({
      success: true,
      message: 'Préstamo eliminado exitosamente'
    });
  } catch (error) {
    if (error.name === 'CastError') {
      return res.status(400).json({ success: false, message: 'ID de préstamo inválido' });
    }
    console.error('Error al eliminar préstamo:', error);
    return res.status(500).json({
      success: false,
      message: 'Error al eliminar préstamo',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};
