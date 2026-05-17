import mongoose from 'mongoose';
import assert from 'node:assert';
import { describe, it, beforeAll, afterAll, beforeEach } from 'vitest';
import { MongoMemoryServer } from 'mongodb-memory-server';
import Account from '../src/models/account.model.js';
import Transaction from '../src/models/transaction.model.js';
import { transfer } from '../src/controllers/account.controller.js';
import { createDeposit, revertDeposit, getPendingDeposits, updateDeposit } from '../src/controllers/deposit.controller.js';

const createMockResponse = () => {
  const res = {};
  res.status = function (code) {
    this.statusCode = code;
    return this;
  };
  res.json = function (payload) {
    this.body = payload;
    return this;
  };
  return res;
};

const createMockRequest = ({ body = {}, params = {}, user = {} } = {}) => ({ body, params, user });

describe('Transacciones y depósitos', () => {
  let mongoServer;

  beforeAll(async () => {
    mongoServer = await MongoMemoryServer.create();
    await mongoose.connect(mongoServer.getUri());
  }, 300000);

  afterAll(async () => {
    await mongoose.disconnect();
    if (mongoServer) {
      await mongoServer.stop();
    }
  });

  beforeEach(async () => {
    await Account.deleteMany({});
    await Transaction.deleteMany({});
  });

  it('crea un depósito GTQ válido y actualiza saldo', async () => {
    const account = await Account.create({
      account_number: '1234567890',
      balance: 100,
      currency: 'GTQ',
      user_id: 'user123',
      estado: 'ACTIVA'
    });

    const req = createMockRequest({
      body: { accountNumber: account.account_number, amount: 500, currency: 'GTQ', description: 'Depósito prueba' }
    });
    const res = createMockResponse();

    await createDeposit(req, res);

    assert.strictEqual(res.statusCode, 201);
    assert.ok(res.body.success);
    assert.strictEqual(res.body.data.new_balance, 600);

    const savedTransaction = await Transaction.findOne({ account_id: account._id });
    assert.ok(savedTransaction);
    assert.strictEqual(savedTransaction.transaction_type, 'DEPOSITO');
    assert.strictEqual(savedTransaction.transaction_amount, 500);
  });

  it('convierte USD a GTQ en depósito y aplica tasa de cambio', async () => {
    const account = await Account.create({
      account_number: '2345678901',
      balance: 100,
      currency: 'GTQ',
      user_id: 'user456',
      estado: 'ACTIVA'
    });

    const req = createMockRequest({
      body: { accountNumber: account.account_number, amount: 100, currency: 'USD', description: 'Depósito con cambio' }
    });
    const res = createMockResponse();

    await createDeposit(req, res);

    assert.strictEqual(res.statusCode, 201);
    assert.ok(res.body.success);
    assert.strictEqual(res.body.data.amount_credited, 780);
    assert.strictEqual(res.body.data.currency_to, 'GTQ');
    assert.strictEqual(res.body.data.currency_from, 'USD');

    const updatedAccount = await Account.findById(account._id);
    assert.strictEqual(updatedAccount.balance, 880);
  });

  it('no permite crear depósito con monto inválido', async () => {
    const account = await Account.create({
      account_number: '3456789012',
      balance: 100,
      currency: 'GTQ',
      user_id: 'user789',
      estado: 'ACTIVA'
    });

    const req = createMockRequest({
      body: { accountNumber: account.account_number, amount: -100, currency: 'GTQ' }
    });
    const res = createMockResponse();

    await createDeposit(req, res);

    assert.strictEqual(res.statusCode, 400);
    assert.strictEqual(res.body.success, false);
    assert.strictEqual(res.body.message, 'Monto inválido');
  });

  it('revertir depósito válido reduce saldo y marca transacción como revertida', async () => {
    const account = await Account.create({
      account_number: '4567890123',
      balance: 200,
      currency: 'GTQ',
      user_id: 'user999',
      estado: 'ACTIVA'
    });

    const transaction = await Transaction.create({
      transaction_name: 'Depósito prueba',
      transaction_amount: 100,
      transaction_type: 'DEPOSITO',
      transaction_method_payment: 'DEPOSITO',
      account_id: account._id,
      user_id: account.user_id,
      revertible: true,
      currency_from: 'GTQ',
      currency_to: 'GTQ'
    });

    const req = createMockRequest({ body: { transactionId: transaction._id.toString() } });
    const res = createMockResponse();

    await revertDeposit(req, res);

    assert.strictEqual(res.statusCode, 200);
    assert.ok(res.body.success);
    assert.strictEqual(res.body.balance, 100);

    const updatedTransaction = await Transaction.findById(transaction._id);
    assert.ok(updatedTransaction.reverted);
    assert.strictEqual(updatedTransaction.revertible, false);
  });

  it('lista depósitos pendientes revertibles', async () => {
    const account = await Account.create({
      account_number: '5678901234',
      balance: 50,
      currency: 'GTQ',
      user_id: 'user321',
      estado: 'ACTIVA'
    });

    await Transaction.create({
      transaction_name: 'Depósito pendiente',
      transaction_amount: 50,
      transaction_type: 'DEPOSITO',
      transaction_method_payment: 'DEPOSITO',
      account_id: account._id,
      user_id: account.user_id,
      revertible: true,
      reverted: false,
      currency_from: 'GTQ',
      currency_to: 'GTQ'
    });

    const req = createMockRequest();
    const res = createMockResponse();

    await getPendingDeposits(req, res);

    assert.strictEqual(res.statusCode, undefined);
    assert.ok(res.body.success);
    assert.strictEqual(res.body.count, 1);
    assert.strictEqual(res.body.deposits[0].canRevert, true);
  });

  it('actualiza un depósito existente y ajusta saldo correctamente', async () => {
    const account = await Account.create({
      account_number: '6789012345',
      balance: 100,
      currency: 'GTQ',
      user_id: 'user654',
      estado: 'ACTIVA'
    });

    const transaction = await Transaction.create({
      transaction_name: 'Depósito original',
      transaction_amount: 50,
      transaction_type: 'DEPOSITO',
      transaction_method_payment: 'DEPOSITO',
      account_id: account._id,
      user_id: account.user_id,
      revertible: true,
      currency_from: 'GTQ',
      currency_to: 'GTQ'
    });

    account.balance += 50;
    await account.save();

    const req = createMockRequest({ params: { id: transaction._id.toString() }, body: { amount: 150 } });
    const res = createMockResponse();

    await updateDeposit(req, res);

    assert.strictEqual(res.statusCode, 200);
    assert.ok(res.body.success);
    assert.strictEqual(res.body.balance, 200);
    assert.strictEqual(res.body.transaction.transaction_amount, 150);
  });

  it('realiza transferencia GTQ entre cuentas con saldo suficiente', async () => {
    const fromAccount = await Account.create({
      account_number: '7890123456',
      balance: 2000,
      currency: 'GTQ',
      user_id: 'user100',
      estado: 'ACTIVA'
    });
    const toAccount = await Account.create({
      account_number: '8901234567',
      balance: 100,
      currency: 'GTQ',
      user_id: 'user200',
      estado: 'ACTIVA'
    });

    const req = createMockRequest({
      body: { fromAccount: fromAccount.account_number, toAccount: toAccount.account_number, amount: 500, description: 'Pago factura' },
      user: { id: fromAccount.user_id }
    });
    const res = createMockResponse();

    await transfer(req, res);

    assert.strictEqual(res.statusCode, undefined);
    assert.ok(res.body.success);
    assert.strictEqual(res.body.transaction.amount_credited, 500);
    assert.strictEqual(res.body.transaction.from, fromAccount.account_number);
    assert.strictEqual(res.body.transaction.to, toAccount.account_number);

    const updatedFrom = await Account.findById(fromAccount._id);
    const updatedTo = await Account.findById(toAccount._id);
    assert.strictEqual(updatedFrom.balance, 1500);
    assert.strictEqual(updatedTo.balance, 600);
  });

  it('no permite transferencia cuando la cuenta origen no tiene saldo suficiente', async () => {
    const fromAccount = await Account.create({
      account_number: '9012345678',
      balance: 100,
      currency: 'GTQ',
      user_id: 'user300',
      estado: 'ACTIVA'
    });
    const toAccount = await Account.create({
      account_number: '0123456789',
      balance: 100,
      currency: 'GTQ',
      user_id: 'user400',
      estado: 'ACTIVA'
    });

    const req = createMockRequest({
      body: { fromAccount: fromAccount.account_number, toAccount: toAccount.account_number, amount: 150, description: 'Pago insuficiente' },
      user: { id: fromAccount.user_id }
    });
    const res = createMockResponse();

    await transfer(req, res);

    assert.strictEqual(res.statusCode, 400);
    assert.strictEqual(res.body.success, false);
    assert.strictEqual(res.body.message, 'Saldo insuficiente');
  });

  it('detecta y rechaza transferencia a la misma cuenta', async () => {
    const account = await Account.create({
      account_number: '1122334455',
      balance: 500,
      currency: 'GTQ',
      user_id: 'user500',
      estado: 'ACTIVA'
    });

    const req = createMockRequest({
      body: { fromAccount: account.account_number, toAccount: account.account_number, amount: 100, description: 'Auto transferencia' },
      user: { id: account.user_id }
    });
    const res = createMockResponse();

    await transfer(req, res);

    assert.strictEqual(res.statusCode, 400);
    assert.strictEqual(res.body.success, false);
    assert.strictEqual(res.body.message, 'No puedes transferir a tu propia cuenta');
  });

  it('realiza transferencia USD a GTQ con conversión correcta', async () => {
    const fromAccount = await Account.create({
      account_number: '2233445566',
      balance: 1000,
      currency: 'USD',
      user_id: 'user600',
      estado: 'ACTIVA'
    });
    const toAccount = await Account.create({
      account_number: '3344556677',
      balance: 100,
      currency: 'GTQ',
      user_id: 'user700',
      estado: 'ACTIVA'
    });

    const req = createMockRequest({
      body: { fromAccount: fromAccount.account_number, toAccount: toAccount.account_number, amount: 100, currency: 'USD', description: 'Cambio USD->GTQ' },
      user: { id: fromAccount.user_id }
    });
    const res = createMockResponse();

    await transfer(req, res);

    assert.strictEqual(res.body.success, true);
    assert.strictEqual(res.body.transaction.amount_credited, 780);
    assert.strictEqual(res.body.transaction.from_currency, 'USD');
    assert.strictEqual(res.body.transaction.to_currency, 'GTQ');

    const updatedFrom = await Account.findById(fromAccount._id);
    const updatedTo = await Account.findById(toAccount._id);
    assert.strictEqual(updatedFrom.balance, 900);
    assert.strictEqual(updatedTo.balance, 880);
  });
});
