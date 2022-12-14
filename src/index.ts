import { fill, groupBy, maxBy, orderBy, take } from 'lodash';
import { Bucket, CountryCodeTransactions, ProcessedTransactionResult, Transaction, TransactionSetAndSum } from './types';

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
    const result: Array<Bucket> = this.getCountryCodeBuckets(this.averageLatencies, totalTime);
    const groupedOrdered = this.groupAndOrder(transactions);
    const setsAndSums: Array<TransactionSetAndSum> = [];
    for (let bucket of result.map(r => r.bucket)) {
      setsAndSums.push(this.getTransactionSetAndSum(bucket, JSON.parse(JSON.stringify(groupedOrdered))));
    }
    // const sums = setsAndSums.map(s => s.sum);
    return maxBy(setsAndSums, 'sum')?.transactions || [];
  }

  groupAndOrder(transactions: Array<Transaction>): Array<CountryCodeTransactions> {
    const groupedOrdered: Array<CountryCodeTransactions> = Object.entries(groupBy(transactions, 'BankCountryCode')).map(
      ([cc, transactions]) => {
        return {
          cc,
          transactions: orderBy(transactions, ['Amount'], ['asc'])
        };
      }
    );
    return groupedOrdered;
  }

  getTransactionSetAndSum(bucket: Array<string>, groupedOrdered: Array<CountryCodeTransactions>): TransactionSetAndSum {
    let sum = 0;
    const transactions = [];
    for (let cc of bucket) {
      const target = groupedOrdered.find(group => group.cc === cc);
      if (target) {
        const topTrans = target.transactions.pop();
        if (topTrans) {
          sum += topTrans.Amount;
          transactions.push(topTrans);
        }
      }
    }
    return { sum, transactions };
  }

  getCountryCodeBuckets(averageLatencies: Record<string, number>, totalTime: number): Array<Bucket> {
    const usable = Object.entries(averageLatencies).filter(([, num]) => num < totalTime);
    const buckets: Array<Bucket> = this.initBuckets(totalTime, usable)
    while (buckets.some(i => !i.fill)) {
      for (let [cc, num] of usable) {
        if (totalTime % num === 0) {
          const bucket: string[] = fill(Array(Math.floor(totalTime / num)), cc);
          buckets.push({
            sum: totalTime,
            bucket,
            fill: true
          });
        }
        for (let bucket of buckets) {
          const nextSum = bucket.sum + num;
          if (nextSum <= totalTime) {
            bucket.sum += num;
            bucket.bucket.push(cc);
          } else {
            bucket.fill = true;
          }
        }
      }
    }
    return buckets;
  }

  private initBuckets(totalTime: number, usable: Array<[string, number]>) {
    const buckets: Array<Bucket> = [];
    usable.forEach(([cc, num]) => {
      buckets.push({
        sum: num,
        bucket: [cc],
        fill: false
      });
      if (totalTime % num > 0) {
        const quotient = Math.floor(totalTime / num);
        const bucket: string[] = fill(Array(quotient), cc);
        buckets.push({
          sum: totalTime,
          bucket,
          fill: false
        });
      }
    });
    return buckets;
  }
}

export class BankApiClient {
  processTransaction(transaction: Transaction): Promise<boolean> {
    return Promise.resolve(false);
  }
}

export class ExperimentalTransactionPrioritization {
  constructor(private averageLatencies: Record<string, number>) {}

  private transInTime(totalTime: number, subset: Array<Transaction & { latency: number }>) {
    const transInTime = [];
    let timeLeft = totalTime;
    for (let transaction of subset) {
      if (timeLeft - transaction.latency > 0) {
        transInTime.push(transaction);
        timeLeft -= transaction.latency;
      }
    }
    return transInTime;
  }

  prioritize1(transactions: Array<Transaction>, totalTime = 1000): Array<Transaction> {
    const transAndLat = transactions.map(t => ({ ...t, latency: this.averageLatencies[t.BankCountryCode] }));
    const subset = orderBy(transAndLat, ['latency', 'Amount'], ['asc', 'desc']).filter(i => i.latency < totalTime);
    return this.transInTime(totalTime, subset);
  }

  prioritize2(transactions: Array<Transaction>, totalTime = 1000) {
    const transAndLat = transactions.map(t => ({ ...t, latency: this.averageLatencies[t.BankCountryCode] }));
    const subset = orderBy(transAndLat, ['Amount'], ['desc']).filter(i => i.latency < totalTime);
    return this.transInTime(totalTime, subset);
  }
}
