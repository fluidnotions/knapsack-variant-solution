import { groupBy, maxBy, orderBy } from 'lodash';
import { CountryCodeTransactions, ProcessedTransactionResult, Transaction, TransactionSetAndSum } from './types';

export class TransactionProcessor {
  constructor(private bankApiClient: BankApiClient, private averageLatencies: Record<string, number>) {}

  async processTransactions(transactions: Array<Transaction>): Promise<Array<ProcessedTransactionResult>> {
    const results: Array<ProcessedTransactionResult> = [];
    for (let transaction of transactions) {
      const fraudulent = await this.bankApiClient.processTransaction(transaction);
      results.push({ id: transaction.ID, fraudulent });
    }
    return results;
  }

  prioritize(transactions: Array<Transaction>, totalTime = 1000): Array<Transaction> {
    const result: Array<Array<string>> = this.getSubsets(this.averageLatencies, totalTime);
    console.log(`prioritize -> prioritize -> result`, result)
    const groupedOrdered: Array<CountryCodeTransactions> = Object.entries(groupBy(transactions, 'BankCountryCode')).map(([cc, transactions]) => {
      return {
        cc,
        transactions: orderBy(transactions, 'Amount', 'desc')
      }
    });
    console.log(`prioritize -> groupedOrdered`, groupedOrdered)
    const setsAndSums: Array<TransactionSetAndSum> = []
    for(let subset of result) {
      setsAndSums.push(this.getTransactionSetAndSum(subset, groupedOrdered))
    }
    console.log(`prioritize -> setsAndSums`, setsAndSums)
    return maxBy(setsAndSums, 'sum')?.transactions || []
  }

  private getTransactionSetAndSum(subset: Array<string>, groupedOrdered: Array<CountryCodeTransactions>): TransactionSetAndSum{
    let sum = 0
    const transactions = []
    for(let cc of subset) {
      const target = groupedOrdered.find((group) => group.cc === cc);
      if (target) {
        const topTrans = target.transactions.pop()
        if (topTrans) {
          sum += topTrans.Amount;
          transactions.push(topTrans);
        }
      }
    }
    return {sum, transactions}
  }

  private getSubsets(averageLatencies: Record<string, number>, totalTime: number): Array<Array<string>> {
      const array: Array<[string, number]> = Object.entries(averageLatencies)
      const fork = (i = 0, s = 0, t: Array<[string, number]> = []) => {
          if (s === totalTime) {
              result.push(t);
              return;
          }
          if (i === array.length) {
              return;
          }
          if (s + array[i][1] <= totalTime) {
              fork(i + 1, s + array[i][1], t.concat(array[i]));
          }
          fork(i + 1, s, t);
      }
      const result: Array<Array<[string, number]>>  = [];
      fork();
      return result.map((s) => s.map(([cc]) => cc));
  }
}

export class BankApiClient {
  processTransaction(transaction: Transaction): Promise<boolean> {
    return Promise.resolve(false);
  }
}

export class ExperimentalTransactionPrioritization {
  constructor(private averageLatencies: Record<string, number>) {}

  private transInTime(totalTime: number, subset: Array<Transaction & {latency: number}>){
    const transInTime = [];
    let timeLeft = totalTime;
    for (let transaction of subset) {
      if (timeLeft - transaction.latency > 0) {
        transInTime.push(transaction);
        timeLeft -=  transaction.latency;
      }
    }
    return transInTime
  }

  prioritize1(transactions: Array<Transaction>, totalTime = 1000): Array<Transaction> {
    const transAndLat = transactions.map((t) => ({ ...t, latency: this.averageLatencies[t.BankCountryCode] }));
    const subset = orderBy(transAndLat, ['latency', 'Amount'], ['asc', 'desc']).filter(i => i.latency < totalTime);
    return this.transInTime(totalTime, subset)
  }

  prioritize2(transactions: Array<Transaction>, totalTime = 1000) {
    const transAndLat = transactions.map((t) => ({ ...t, latency: this.averageLatencies[t.BankCountryCode] }));
    const subset = orderBy(transAndLat, ['Amount'], ['desc']).filter(i => i.latency < totalTime);
    return this.transInTime(totalTime, subset)
  }

}
