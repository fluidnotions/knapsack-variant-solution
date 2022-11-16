# Max total USD by prioritizing transactions according to latency sum within given time

## Results

[unit tests](./test/TransactionProcessor.test.ts)

```
[1000] totalAmount: $ 13768.36
[90] totalAmount: $ 5581.01
[60] totalAmount: $ 4139.43
[50] totalAmount: $ 3474.55
```

## Experimental Implementation With Variant Datasets

[experimental implementation tests](./test/ExperimentalTransactionPrioritization.test.ts)

```
variants:  { totalTime: 1000, exclN: 0 }
[prioritize2] totalAmount: $ 9725.410000000005
[prioritize4] totalAmount: $ 13768.359999999999
variants:  { totalTime: 1000, exclN: 1 }
[prioritize2] totalAmount: $ 8047.83
[prioritize4] totalAmount: $ 13597.16
variants:  { totalTime: 50, exclN: 1 }
[prioritize2] totalAmount: $ 3188.6000000000004
[prioritize4] totalAmount: $ 999.17 
variants:  { totalTime: 90, exclN: 1 }
[prioritize2] totalAmount: $ 4971.42
[prioritize4] totalAmount: $ 3759.51
variants:  { totalTime: 90, exclN: 0 }
[prioritize2] totalAmount: $ 5581.01
[prioritize4] totalAmount: $ 3901.4199999999996
```

### Insights

There is likely a more elegant solution, perhaps an existing algorithm out there that gets to the heart of this. I didn't google this one, because it's the most interesting problem test I've had this month. I got to 2h30m and stopped the differential analysis. Since space/time of prioritize was excluded in the criteria, I just went with a combo solution. Used the last 30m to add some fluff (the mock ./test/TransactionProcessor.test.ts 'processTransactions') to the main test & wrote this readme  


