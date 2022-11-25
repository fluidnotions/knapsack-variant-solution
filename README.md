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

## Algorithm Design

* initBuckets method sets up a starting point for all possible combinations of country code groupings
* the combinations of country code groupings, referred to as buckets in the code, are then filled so that they have a total latency sum less then or equal to the allowed time frame.
* grouping the transactions by country code and order transaction amounts asc (This held in the variable named groupedOrdered), so that the hightest can be popped off the array, thereby 
insuring there is no transaction duplication within a bucket that contains multiple items of the same country code. 
* a clone of groupedOrdered is passed into a function that assembles the transaction set and finds the total of all the transaction amounts in the bucket. The clones insure the pop array function doesn't effect the next bucket.
* once all buckets have a transaction set and total amount sum, the transaction set with the highest amount can be selected and returned

## Algorithm Choice

* the approach ensures all possible combinations are considered
* including buckets filled by duplicate country codes.
* including buckets filled by quotient whole number duplicate country codes & whatever other country code combinations can fill the remaining space in the bucket

## Optimization

* Efforts where made to remove redundant loops, via code block placement
* The code was not completely optimized for space/time given time constraints.




