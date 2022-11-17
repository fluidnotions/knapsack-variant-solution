# Max total USD by prioritizing transactions according to latency sum within given time

## Results

[unit tests](./test/TransactionProcessor.test.ts)

### Approach 1 Results 

```
[1000] totalAmount: $ 13768.36
[90] totalAmount: $ 5581.01
[60] totalAmount: $ 4139.43
[50] totalAmount: $ 3474.55
```

### Approach 2 Results 

```
[1000] totalAmount: $ 13090.12
[90] totalAmount: $ 3635.76
[60] totalAmount: $ 2771.49
[50] totalAmount: $ 3517.85
```


## References

* [Subset sum problem](https://en.wikipedia.org/wiki/Subset_sum_problem)
* [Return all subsets whose sum is a given value (subset sum problem)](https://stackoverflow.com/a/53659385)
* [four number sum](https://www.algoexpert.io/questions/four-number-sum)

## Insights

There are differences between this use case and the subset sum problem. In that we want all possible combinations, so check which is the highest. While I was looking at that approach I came up with this one. Given the question uses the word 'bucket' it got me thinking along those lines.


