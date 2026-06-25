import CreditCard from '../models/credit-card.model.js';

export const getMyCreditCards = async (req, res) => {
  try {
    const userId = req.user.id;
    const cards = await CreditCard.find({ user_id: userId }).sort({ createdAt: -1 });

    return res.json({
      success: true,
      total: cards.length,
      cards
    });
  } catch (error) {
    console.error('Error al obtener tarjetas:', error);
    return res.status(500).json({
      success: false,
      message: 'Error al obtener tus tarjetas de crédito',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

export const getAllCreditCards = async (req, res) => {
  try {
    const page = parseInt(req.query.page, 10) || 1;
    const limit = parseInt(req.query.limit, 10) || 20;
    const skip = (page - 1) * limit;

    const filter = {};
    if (req.query.user_id) filter.user_id = req.query.user_id;
    if (req.query.status) filter.status = req.query.status;

    const total = await CreditCard.countDocuments(filter);
    const cards = await CreditCard.find(filter)
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit);

    return res.json({
      success: true,
      count: cards.length,
      cards,
      pagination: {
        total,
        page,
        pages: Math.ceil(total / limit) || 1,
        limit
      }
    });
  } catch (error) {
    console.error('Error al obtener tarjetas:', error);
    return res.status(500).json({
      success: false,
      message: 'Error al obtener tarjetas de crédito',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

export const createCreditCard = async (req, res) => {
  try {
    const { name, type, currency, authorizedLimit, balanceDue, availableBalance, minimumPayment, fullPayment, cutOffDate, paymentDueDate, user_id } = req.body;

    if (!user_id) {
      return res.status(400).json({
        success: false,
        message: 'El user_id es requerido'
      });
    }

    const card = new CreditCard({
      name,
      type,
      currency,
      authorizedLimit,
      balanceDue,
      availableBalance,
      minimumPayment,
      fullPayment,
      cutOffDate,
      paymentDueDate,
      user_id
    });

    await card.save();

    return res.status(201).json({
      success: true,
      message: 'Tarjeta de crédito creada exitosamente',
      card
    });
  } catch (error) {
    if (error.name === 'ValidationError') {
      return res.status(400).json({ success: false, message: 'Datos inválidos', error: error.message });
    }
    console.error('Error al crear tarjeta:', error);
    return res.status(500).json({
      success: false,
      message: 'Error al crear tarjeta de crédito',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

export const updateCreditCard = async (req, res) => {
  try {
    const { id } = req.params;
    const updates = req.body;

    const card = await CreditCard.findByIdAndUpdate(id, updates, { new: true, runValidators: true });

    if (!card) {
      return res.status(404).json({
        success: false,
        message: 'Tarjeta de crédito no encontrada'
      });
    }

    return res.json({
      success: true,
      message: 'Tarjeta de crédito actualizada exitosamente',
      card
    });
  } catch (error) {
    if (error.name === 'ValidationError') {
      return res.status(400).json({ success: false, message: 'Datos inválidos', error: error.message });
    }
    if (error.name === 'CastError') {
      return res.status(400).json({ success: false, message: 'ID de tarjeta inválido' });
    }
    console.error('Error al actualizar tarjeta:', error);
    return res.status(500).json({
      success: false,
      message: 'Error al actualizar tarjeta de crédito',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

export const deleteCreditCard = async (req, res) => {
  try {
    const { id } = req.params;

    const card = await CreditCard.findByIdAndDelete(id);

    if (!card) {
      return res.status(404).json({
        success: false,
        message: 'Tarjeta de crédito no encontrada'
      });
    }

    return res.json({
      success: true,
      message: 'Tarjeta de crédito eliminada exitosamente'
    });
  } catch (error) {
    if (error.name === 'CastError') {
      return res.status(400).json({ success: false, message: 'ID de tarjeta inválido' });
    }
    console.error('Error al eliminar tarjeta:', error);
    return res.status(500).json({
      success: false,
      message: 'Error al eliminar tarjeta de crédito',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};
