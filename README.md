# Max total USD by prioritizing transactions according to latency sum within given time

[problem instructions](https://gist.github.com/Valve/834d7122ca75dc58d28c3e4be5a15506)

## Results

[unit tests](./test/TransactionProcessor.test.ts)

### Approach Results 

```
[1000] totalAmount: $ 98928.51
[90] totalAmount: $ 5763.62
[60] totalAmount: $ 4654.24
[50] totalAmount: $ 4139.43
```


## References

* [Subset sum problem](https://en.wikipedia.org/wiki/Subset_sum_problem)
* [four number sum](https://www.algoexpert.io/questions/four-number-sum)

## Algorithm Design

* create all possible combinations of country code groupings, referred to as buckets in the code, that have a total latency sum less then or equal to the allowed time frame.
* group the transactions by country code and order transaction amounts asc (This held in the variable named groupedOrdered), so that the hightest can be popped off the array, thereby 
insuring there is no transaction duplication within a bucket that contains multiple items of the same country code. 
* a clone of groupedOrdered is passed into a function that assembles the transaction set and finds the total of all the transaction amounts in the bucket. The clones insure the pop array function doesn't effect the next bucket.
* once all buckets have a transaction set and total amount sum, the transaction set with the highest amount can be selected and returned

## Why is this the best algorithm design?

Because it can easily be extended to ensure all the transactions are sent in a prioritized order. By tracking the ids sent and excluding them in the transactions argument to the prioritize method. You could call prioritize multiple times and ensure the complete transactions list was sent in the optimal order, even with a variable totalTime across prioritize invocations




