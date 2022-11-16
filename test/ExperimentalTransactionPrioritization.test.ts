import { minBy, orderBy, take } from 'lodash';
import { ExperimentalTransactionPrioritization } from '../src';
import { Transaction } from '../src/types';
import csv from 'csvtojson';
import { join } from 'path';

const excludeFastestN = (n: number, transactionList: Array<Transaction>, latencies: Record<string, number>) => {
  if (n > 0) {
    const lats = orderBy(Object.entries(latencies), [(l) => l[1]], ['asc']);
    const exclude = take(lats, n).map((l) => l[0]);
    return transactionList.filter((t) => !exclude.includes(t.BankCountryCode));
  }else return transactionList
}

describe('ExperimentalTransactionPrioritization', () => {
  let experimental: ExperimentalTransactionPrioritization;
  let transactionList: Array<Transaction>;
  const latencies = require('./__data/latencies.json');
  const totalTime = 90;
  const exclN = 0;

  beforeAll(async () => {
    experimental = new ExperimentalTransactionPrioritization(latencies);
    const transactionListAll = (await csv().fromFile(join(__dirname, '__data/transactions.csv'))).map((transaction: any) => {
      return {
        ID: transaction.id,
        Amount: parseFloat(transaction.amount),
        BankCountryCode: transaction.bank_country_code
      };
    });
    transactionList = excludeFastestN(exclN, transactionListAll, latencies)
    console.log("variants: ", {totalTime, exclN})
  });

  xit('min', () => {
    const min = minBy(Object.entries(latencies), ([, latency]) => {
      return latency;
    });
    console.log(`lat min`, min);
  });

  xit('ordered asc', () => {
    const asc = orderBy(Object.entries(latencies), ([, latency]) => {
      return latency;
    });
    console.log(`lat asc`, asc);
  });

  xit('[prioritize] should return the max amount in totalTime ms', () => {
    const lowBound = 0;
    const subset = experimental.prioritize(transactionList, totalTime);
    const totalAmount = subset.reduce((acc, transaction) => acc + transaction.Amount, 0);
    console.log(`[prioritize] totalAmount: $`, totalAmount);
    expect(totalAmount).toBeGreaterThan(lowBound);
  });

  it('[prioritize2] should return the max amount totalTime ms', () => {
    const lowBound = 0;
    const subset = experimental.prioritize2(transactionList, totalTime);
    const totalAmount = subset.reduce((acc, transaction) => acc + transaction.Amount, 0);
    console.log(`[prioritize2] totalAmount: $`, totalAmount);
    expect(totalAmount).toBeGreaterThan(lowBound);
  });

  it('[prioritize4] should return the max amount in totalTime ms', () => {
    const lowBound = 0;
    const subset = experimental.prioritize4(transactionList, totalTime);
    const totalAmount = subset.reduce((acc, transaction) => acc + transaction.Amount, 0);
    console.log(`[prioritize4] totalAmount: $`, totalAmount);
    expect(totalAmount).toBeGreaterThan(lowBound);
  });

});
