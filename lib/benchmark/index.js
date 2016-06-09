'use strict';

const _ = require('lodash');
const Benchmark = require('benchmark');

module.exports = (funcs) => {

  return (callback) => {
    var suite = new Benchmark.Suite();
    var total = {};
    _.forEach(funcs, (func, key) => {
      total[key] = {
        count: 0,
        time: 0
      };
      suite.add(key, {
        defer: true,
        fn: (deferred) => {
          var start = process.hrtime();
          func(() => {
            var diff = process.hrtime(start);
            total[key].time += (diff[0] * 1e9 + diff[1]) / 1000;
            total[key].count++;
            deferred.resolve();
          });
        }
      });
    });

    suite
      .on('complete', function() {
        var result = _.chain(this)
          .map((data) => {
            var name = data.name;
            var time = total[name];
            return {
              name: name,
              mean: time.time / time.count
            };
          })
          .sortBy('mean')
          .value();

        callback(null, result);
      })
      .run({
        async: true
      });
  };
};
