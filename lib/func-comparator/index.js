'use strict';

const _ = require('lodash');
const Comparator = require('func-comparator').Comparator;

module.exports = (funcs, times) => {

  return (callback) => {
    new Comparator()
      .set(funcs)
      .async()
      .times(times)
      .start()
      .result((err, res) => {
        if (err) {
          return callback(err);
        }
        let result = _.chain(res)
          .map((data, name) => {
            return {
              name: name,
              mean: data.average
            };
          })
          .sortBy('mean')
          .value();

        callback(null, result);
      });
  };
};
