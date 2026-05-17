import assert from 'node:assert';
import { describe, it, beforeEach, afterEach } from 'node:test';
import Account from '../src/models/account.model.js';
import Transaction from '../src/models/transaction.model.js';
import { createDeposit, revertDeposit } from '../src/controllers/deposit.controller.js';
import { transfer } from '../src/controllers/account.controller.js';

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
  let originalAccountFindOne;
  let originalAccountFindById;
  let originalTransactionAggregate;
  let originalTransactionFindById;
  let originalTransactionSave;

  beforeEach(() => {
    originalAccountFindOne = Account.findOne;
    originalAccountFindById = Account.findById;
    originalTransactionAggregate = Transaction.aggregate;
    originalTransactionFindById = Transaction.findById;
    originalTransactionSave = Transaction.prototype.save;
  });

  afterEach(() => {
    Account.findOne = originalAccountFindOne;
    Account.findById = originalAccountFindById;
    Transaction.aggregate = originalTransactionAggregate;
    Transaction.findById = originalTransactionFindById;
    Transaction.prototype.save = originalTransactionSave;
  });

  it('crea un depósito GTQ válido y actualiza saldo', async () => {
    const account = {
      account_number: '1234567890',
      balance: 100,
      currency: 'GTQ',
      estado: 'ACTIVA',
      user_id: 'user123',
      save: async function () {
        return this;
      }
    };

    Account.findOne = async (query) => {
      if (query.account_number === account.account_number) return account;
      return null;
    };

    Transaction.aggregate = async () => [];

    let savedTransaction;
    Transaction.prototype.save = async function () {
      this.createdAt = new Date();
      savedTransaction = this;
      return this;
    };

    const req = createMockRequest({
      body: { accountNumber: account.account_number, amount: 500, currency: 'GTQ', description: 'Depósito prueba' }
    });
    const res = createMockResponse();

    await createDeposit(req, res);

    assert.strictEqual(res.statusCode, 201);
    assert.ok(res.body.success);
    assert.strictEqual(res.body.data.new_balance, 600);
    assert.strictEqual(account.balance, 600);
    assert.strictEqual(savedTransaction.transaction_type, 'DEPOSITO');
    assert.strictEqual(savedTransaction.transaction_amount, 500);
  });

  it('no permite crear depósito con monto inválido', async () => {
    const account = {
      account_number: '3456789012',
      balance: 100,
      currency: 'GTQ',
      estado: 'ACTIVA',
      user_id: 'user789',
      save: async function () {
        return this;
      }
    };

    Account.findOne = async (query) => {
      if (query.account_number === account.account_number) return account;
      return null;
    };

    Transaction.aggregate = async () => [];
    Transaction.prototype.save = async function () {
      return this;
    };

    const req = createMockRequest({
      body: { accountNumber: account.account_number, amount: -100, currency: 'GTQ' }
    });
    const res = createMockResponse();

    await createDeposit(req, res);

    assert.strictEqual(res.statusCode, 400);
    assert.strictEqual(res.body.success, false);
    assert.strictEqual(res.body.message, 'Monto inválido');
  });

  it('realiza transferencia GTQ entre cuentas con saldo suficiente', async () => {
    const fromAccount = {
      account_number: '7890123456',
      balance: 2000,
      currency: 'GTQ',
      user_id: 'user100',
      estado: 'ACTIVA',
      single_transfer_limit: 2000,
      daily_transfer_limit: 10000,
      daily_transferred_amount: 0,
      last_transfer_date: null,
      save: async function () {
        return this;
      }
    };
    const toAccount = {
      account_number: '8901234567',
      balance: 100,
      currency: 'GTQ',
      estado: 'ACTIVA',
      save: async function () {
        return this;
      }
    };

    Account.findOne = async (query) => {
      if (query.user_id === fromAccount.user_id && query.account_number === fromAccount.account_number) return fromAccount;
      if (query.account_number === toAccount.account_number) return toAccount;
      return null;
    };

    let savedTransaction;
    Transaction.prototype.save = async function () {
      this.createdAt = new Date();
      savedTransaction = this;
      return this;
    };

    const req = createMockRequest({
      body: { fromAccount: fromAccount.account_number, toAccount: toAccount.account_number, amount: 500, description: 'Pago factura' },
      user: { id: fromAccount.user_id }
    });
    const res = createMockResponse();

    await transfer(req, res);

    assert.ok(res.body.success);
    assert.strictEqual(res.body.transaction.amount_credited, 500);
    assert.strictEqual(res.body.transaction.from, fromAccount.account_number);
    assert.strictEqual(res.body.transaction.to, toAccount.account_number);
    assert.strictEqual(fromAccount.balance, 1500);
    assert.strictEqual(toAccount.balance, 600);
    assert.strictEqual(savedTransaction.transaction_type, 'TRANSFERENCIA');
  });

  it('revertir depósito válido reduce saldo y marca transacción como revertida', async () => {
    const account = {
      _id: 'account123',
      balance: 200,
      save: async function () {
        return this;
      }
    };

    const transaction = {
      _id: 'transaction123',
      transaction_type: 'DEPOSITO',
      reverted: false,
      revertible: true,
      account_id: account._id,
      transaction_amount: 100,
      createdAt: new Date(),
      save: async function () {
        this.reverted = true;
        this.revertible = false;
        return this;
      }
    };

    Transaction.findById = async () => transaction;
    Account.findById = async () => account;

    const req = createMockRequest({ body: { transactionId: transaction._id } });
    const res = createMockResponse();

    await revertDeposit(req, res);

    assert.strictEqual(res.statusCode, 200);
    assert.ok(res.body.success);
    assert.strictEqual(account.balance, 100);
    assert.strictEqual(transaction.reverted, true);
  });
});
