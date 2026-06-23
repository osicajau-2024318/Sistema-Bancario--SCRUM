import test from 'node:test';
import assert from 'node:assert/strict';

import Favorite from '../src/models/favorite.model.js';
import Account from '../src/models/account.model.js';
import Transaction from '../src/models/transaction.model.js';
import { transferFromFavorite } from '../src/services/favorite.service.js';

const originalFetch = global.fetch;

test('transferFromFavorite convierte moneda cuando origen y destino usan monedas distintas', async () => {
  const savedTransactions = [];
  const fromAccount = {
    _id: 'from-account-id',
    user_id: 'user-1',
    account_number: '1001',
    currency: 'GTQ',
    balance: 100,
    estado: 'ACTIVA',
    single_transfer_limit: 1000,
    daily_transfer_limit: 10000,
    daily_transferred_amount: 0,
    last_transfer_date: null,
    save: async function () {
      this.saved = true;
      return this;
    }
  };

  const toAccount = {
    _id: 'to-account-id',
    user_id: 'user-2',
    account_number: '2002',
    currency: 'USD',
    balance: 20,
    estado: 'ACTIVA',
    single_transfer_limit: 1000,
    daily_transfer_limit: 10000,
    daily_transferred_amount: 0,
    last_transfer_date: null,
    save: async function () {
      this.saved = true;
      return this;
    }
  };

  const favorite = {
    alias: 'Mamá',
    account_number: '2002'
  };

  Account.findOne = async (query) => {
    if (query.user_id && query.account_number) {
      return fromAccount;
    }

    return toAccount;
  };

  Favorite.findOne = async () => favorite;

  Transaction.prototype.save = async function () {
    savedTransactions.push(this);
    return this;
  };

  global.fetch = async () => ({
    ok: true,
    headers: {
      get: () => 'application/json'
    },
    json: async () => ({
      gtq: { rate: 7.75 }
    })
  });

  const result = await transferFromFavorite('Mamá', 78, 'user-1', '1001');

  assert.equal(result.success, true);
  assert.equal(fromAccount.balance, 22);
  assert.equal(toAccount.balance, 30.06);
  assert.equal(savedTransactions.length, 2);
  assert.equal(savedTransactions[0].exchange_rate, 7.75);
  assert.equal(savedTransactions[0].currency_from, 'GTQ');
  assert.equal(savedTransactions[0].currency_to, 'USD');
  assert.equal(savedTransactions[0].original_amount, 78);
  assert.equal(savedTransactions[0].converted_amount, 10.06);

  global.fetch = originalFetch;
});
