import mongoose from 'mongoose';
import Product from '../models/product.model.js';
import Account from '../models/account.model.js';
import Transaction from '../models/transaction.model.js';
import ServicePayment from '../models/service-payment.model.js';
import { convertCurrency } from './currency.controller.js';

// NOTA: el CRUD del modelo Service (createService/getServices/etc.) se retiró
// porque el catálogo y la administración de servicios vive en Product con
// type=SERVICIO. El router /services responde 410 Gone (ver service.routes.js).
// Este archivo conserva únicamente los pagos de servicios, que sí son
// transacciones reales y se consumen activamente desde el frontend.

function isAdminRole(role) {
  return role === 'ADMIN' || role === 'ADMIN_ROLE';
}

export const createServicePayment = async (req, res) => {
  let session = null;
  try {
    const userId = req.user.id;
    const userRole = req.user.role;
    const { serviceId, accountId, amount, currency, reference, description } = req.body;

    const requestedAmount = Number(amount);
    if (!Number.isFinite(requestedAmount) || requestedAmount <= 0) {
      return res.status(400).json({
        success: false,
        message: 'El monto debe ser mayor a 0',
      });
    }

    const serviceProduct = await Product.findById(serviceId);
    if (!serviceProduct || serviceProduct.type !== 'SERVICIO') {
      return res.status(404).json({
        success: false,
        message: 'Servicio no encontrado',
      });
    }
    if (!serviceProduct.is_active) {
      return res.status(400).json({
        success: false,
        message: 'El servicio no está activo',
      });
    }

    const account = await Account.findById(accountId);
    if (!account) {
      return res.status(404).json({
        success: false,
        message: 'Cuenta no encontrada',
      });
    }
    if (account.estado !== 'ACTIVA') {
      return res.status(400).json({
        success: false,
        message: 'La cuenta debe estar activa para realizar pagos',
      });
    }

    if (!isAdminRole(userRole) && account.user_id !== userId) {
      return res.status(403).json({
        success: false,
        message: 'No tienes permisos para usar esta cuenta',
      });
    }

    const currencyFrom = String(currency || account.currency || 'GTQ').toUpperCase();
    const currencyTo = String(account.currency || 'GTQ').toUpperCase();

    let amountDebited = requestedAmount;
    let exchangeRate = null;
    if (currencyFrom !== currencyTo) {
      amountDebited = await convertCurrency(currencyFrom, currencyTo, requestedAmount);
      exchangeRate = requestedAmount > 0 ? Number((amountDebited / requestedAmount).toFixed(6)) : null;
    }

    if (account.balance < amountDebited) {
      return res.status(400).json({
        success: false,
        message: 'Saldo insuficiente para pagar el servicio',
      });
    }

    session = await mongoose.startSession();
    session.startTransaction();

    account.balance -= amountDebited;
    await account.save({ session });

    const txName = description?.trim()
      ? `Pago de servicio: ${description.trim()}`
      : `Pago de servicio: ${serviceProduct.name}`;

    const transaction = new Transaction({
      transaction_name: txName,
      transaction_amount: amountDebited,
      transaction_type: 'DEBITO',
      transaction_method_payment: 'COMPRA',
      from_account: account.account_number,
      to_account: null,
      exchange_rate: exchangeRate,
      currency_from: currencyFrom,
      currency_to: currencyTo,
      account_id: account._id,
      user_id: account.user_id,
    });
    await transaction.save({ session });

    const payment = new ServicePayment({
      service_id: serviceProduct._id,
      account_id: account._id,
      transaction_id: transaction._id,
      user_id: account.user_id,
      amount_requested: requestedAmount,
      amount_debited: amountDebited,
      currency_from: currencyFrom,
      currency_to: currencyTo,
      exchange_rate: exchangeRate,
      reference: String(reference || '').trim(),
      description: String(description || '').trim(),
      status: 'COMPLETADO',
    });
    await payment.save({ session });

    await session.commitTransaction();
    session.endSession();
    session = null;

    return res.status(201).json({
      success: true,
      message: 'Pago de servicio realizado correctamente',
      data: {
        payment: payment.toObject(),
        transaction: transaction.toObject(),
        new_balance: account.balance,
      },
    });
  } catch (error) {
    if (session) {
      try {
        await session.abortTransaction();
        session.endSession();
      } catch {
        // no-op
      }
    }
    console.error(error);
    return res.status(500).json({
      success: false,
      message: 'Error al pagar servicio',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined,
    });
  }
};

export const getMyServicePayments = async (req, res) => {
  try {
    const userId = req.user.id;
    const { serviceId, accountId, status, from_date, to_date } = req.query;

    const filter = { user_id: userId };
    if (serviceId && mongoose.Types.ObjectId.isValid(serviceId)) filter.service_id = serviceId;
    if (accountId && mongoose.Types.ObjectId.isValid(accountId)) filter.account_id = accountId;
    if (status) filter.status = status;
    if (from_date || to_date) {
      filter.createdAt = {};
      if (from_date) filter.createdAt.$gte = new Date(from_date);
      if (to_date) filter.createdAt.$lte = new Date(to_date);
    }

    const payments = await ServicePayment.find(filter)
      .sort({ createdAt: -1 })
      .populate('service_id', 'name type price is_active')
      .populate('account_id', 'account_number currency')
      .populate('transaction_id', 'transaction_type transaction_amount createdAt');

    return res.json({
      success: true,
      total: payments.length,
      payments,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: 'Error al obtener pagos de servicios',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined,
    });
  }
};

export const getAllServicePayments = async (req, res) => {
  try {
    const { serviceId, accountId, user_id, status, from_date, to_date } = req.query;
    const filter = {};

    if (serviceId && mongoose.Types.ObjectId.isValid(serviceId)) filter.service_id = serviceId;
    if (accountId && mongoose.Types.ObjectId.isValid(accountId)) filter.account_id = accountId;
    if (user_id) filter.user_id = user_id;
    if (status) filter.status = status;
    if (from_date || to_date) {
      filter.createdAt = {};
      if (from_date) filter.createdAt.$gte = new Date(from_date);
      if (to_date) filter.createdAt.$lte = new Date(to_date);
    }

    const payments = await ServicePayment.find(filter)
      .sort({ createdAt: -1 })
      .populate('service_id', 'name type price is_active')
      .populate('account_id', 'account_number currency user_id')
      .populate('transaction_id', 'transaction_type transaction_amount createdAt');

    return res.json({
      success: true,
      total: payments.length,
      payments,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: 'Error al obtener pagos de servicios',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined,
    });
  }
};
