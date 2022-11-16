import { writeFileSync } from 'fs';
import { orderBy } from 'lodash';
import { join } from 'path';
import { ProcessedTransactionResult, Transaction } from './types';

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
    const transAndLat = transactions.map((t) => ({ ...t, latency: this.averageLatencies[t.BankCountryCode] }));
    const prep1 = orderBy(transAndLat, ['latency', 'Amount'], ['asc', 'desc']).filter(i => i.latency < totalTime);
    const subset1 = this.transInTime(totalTime, prep1)
    const totalAmount1 = subset1.reduce((acc, transaction) => acc + transaction.Amount, 0);
    const prep2 =  orderBy(transAndLat, ['Amount'], ['desc']).filter(i => i.latency < totalTime);
    const subset2 = this.transInTime(totalTime, prep2)
    const totalAmount2 = subset1.reduce((acc, transaction) => acc + transaction.Amount, 0);
    return totalAmount1 > totalAmount2 ? subset1 : subset2
  }

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

  prioritize(transactions: Array<Transaction>, totalTime = 1000): Array<Transaction> {
    const transAndLat = transactions.map((t) => ({ ...t, latency: this.averageLatencies[t.BankCountryCode] }));
    const subset = transAndLat.sort((a, b) => {
      return a.latency - b.latency;
    });
    writeFileSync(join(__dirname, '..', 'experimental-output', 'prioritize-out.json'), JSON.stringify(subset, null, 2))
    return this.transInTime(totalTime, subset)
  }

  prioritize2(transactions: Array<Transaction>, totalTime = 1000): Array<Transaction> {
    const transAndLat = transactions.map((t) => ({ ...t, latency: this.averageLatencies[t.BankCountryCode] }));
    const subset = orderBy(transAndLat, ['latency', 'Amount'], ['asc', 'desc']);
    writeFileSync(join(__dirname, '..', 'experimental-output', 'prioritize2-out.json'), JSON.stringify(subset, null, 2))
    return this.transInTime(totalTime, subset)
  }

  prioritize4(transactions: Array<Transaction>, totalTime = 1000) {
    const transAndLat = transactions.map((t) => ({ ...t, latency: this.averageLatencies[t.BankCountryCode] }));
    const subset = orderBy(transAndLat, ['Amount'], ['desc']).filter(i => i.latency < totalTime);
    writeFileSync(join(__dirname, '..', 'experimental-output', 'prioritize4-out.json'), JSON.stringify(subset, null, 2))
    return this.transInTime(totalTime, subset)
  }

}
