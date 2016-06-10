# Async-Benchmark

This module measures performance async and neo-async using benchmark.js and func-comparator.

## How to use

```bash
$ git clone git@github.com:suguru03/async-benchmark.git
$ cd async-benchmark
$ npm install
$ node .

/*
 * ======================================
 * benchmark
 * func-comparator
 * ======================================
 * [async_current], v2.0.0-rc.6
 * [neo-async_current], v2.0.0-rc.1
 * ======================================
 * [each:array] Comparating...
 * --------------------------------------
 * [benchmark] Executing...
 * [1] "neo-async_current" 8.26μs[1.00][1.00]
 * [2] "async_current" 30.7μs[0.269][3.71]
 * --------------------------------------
 * [func-comparator] Executing...
 * [1] "neo-async_current" 79.2μs[1.00][1.00]
 * [2] "async_current" 201μs[0.394][2.54]
 * ====================================== ...
 */
```

