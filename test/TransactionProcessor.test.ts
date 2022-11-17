import { BankApiClient, ExperimentalTransactionPrioritization, TransactionProcessor } from '../src';
import { Transaction } from '../src/types';
import 'jest-extended';
import { mock } from 'jest-mock-extended';
import csv from 'csvtojson';
import { join } from 'path';
import { take } from 'lodash';

describe('TransactionProcessor', () => {
  let transactionProcessor: TransactionProcessor;
  let transactionList: Array<Transaction>;
  

  beforeAll(async () => {
    const latencies = require('./__data/latencies.json');
    const bankApiClient = mock<BankApiClient>({
      processTransaction: async (transaction: Transaction) => {
        return new Promise(resolve => {
          setTimeout(() => {
            resolve(false);
          }, latencies[transaction.BankCountryCode]);
        });
      }
    });
    transactionProcessor = new TransactionProcessor(bankApiClient, latencies);
    transactionList = (await csv().fromFile(join(__dirname, '__data/transactions.csv'))).map((transaction: any) => {
      return {
        ID: transaction.id,
        Amount: parseFloat(transaction.amount),
        BankCountryCode: transaction.bank_country_code
      };
    });
  });

  afterAll(() => {
    jest.resetAllMocks();
  });



  describe('prioritize', () => {
    //50ms, 60ms, 90ms, 1000ms
    it('should return the max amount in 1000ms', async () => {
      const lowBound = 0;
      const subset = transactionProcessor.prioritize(transactionList, 1000);
      const totalAmount = subset.reduce((acc, transaction) => acc + transaction.Amount, 0);
      console.log(`[1000] totalAmount: $`, totalAmount);
      expect(totalAmount).toBeGreaterThan(lowBound);
    });
    
    it('should return the max amount in 90ms', async () => {
      const lowBound = 0;
      const subset = transactionProcessor.prioritize(transactionList, 90);
      const totalAmount = subset.reduce((acc, transaction) => acc + transaction.Amount, 0);
      console.log(`[90] totalAmount: $`, totalAmount);
      expect(totalAmount).toBeGreaterThan(lowBound);
    });

    it('should return the max amount in 60ms', async () => {
      const lowBound = 0;
      const subset = transactionProcessor.prioritize(transactionList, 60);
      const totalAmount = subset.reduce((acc, transaction) => acc + transaction.Amount, 0);
      console.log(`[60] totalAmount: $`, totalAmount);
      expect(totalAmount).toBeGreaterThan(lowBound);
    });

    it('should return the max amount in 50ms', async () => {
      const lowBound = 0;
      const subset = transactionProcessor.prioritize(transactionList, 50);
      const totalAmount = subset.reduce((acc, transaction) => acc + transaction.Amount, 0);
      console.log(`[50] totalAmount: $`, totalAmount);
      expect(totalAmount).toBeGreaterThan(lowBound);
    });
  });

});
