'use strict';

const path = require('path');

const _ = require('lodash');
const Comparator = require('func-comparator').Comparator;

const async = require('./neo-async');
const functions = {
  'async': require('async'),
  'neo-async_pre': require('neo-async'),
  'neo-async_current': async
};

console.log('--------------------------------------');
_.forEach(functions, (async, key) => {
  let version = async.VERSION;
  if (!version) {
    let p = path.resolve(__dirname, 'node_modules', key, 'package.json');
    version = _.get(require(p), 'version');
  }
  console.log('[%s] v%s', key, version);
});

const config = _.get(global, 'config', require('./config'));
const defaults = config.defaults;
const args = _.get(global, 'argv', _.slice(process.argv, 2));

let tasks = _.omit(config, 'defaults');

if (!_.isEmpty(args)) {
  let regExps = _.map(args, (arg) => {
    return new RegExp('^' + arg);
  });
  tasks = _.pickBy(tasks, (task, name) => {
    return _.some(regExps, (regExp) => {
      return regExp.test(name);
    });
  });
}

async.eachSeries(tasks, (task, name, next) => {
  let avaiable = task.avaiable === undefined ? defaults.avaiable : task.avaiable;
  if (!avaiable) {
    return next();
  }
  let count = _.get(task, 'count', defaults.count);
  let times = _.get(task, 'times', defaults.times);
  let setup = _.get(task, 'setup', defaults.times);

  let func = _.get(task, 'func', defaults.func);
  let useFunctions = defaults.functions;
  if (task.functions) {
    useFunctions = _.filter(useFunctions, (func, index) => {
      return _.includes(task.functions, index);
    });
  }

  let funcs = _.chain(functions)
    .pick(useFunctions)
    .mapValues((async, key) => {
      if (_.isFunction(func)) {
        return function(callback) {
          func(async, callback);
        };
      }
      var _func = _.get(func, key, func['default']);
      return function(callback) {
        _func(async, callback);
      };
    })
    .value();

  setup(count);

  console.log('--------------------------------------');
  console.log('[%s] Comparating...', name, useFunctions);
  new Comparator()
    .set(funcs)
    .async()
    .times(times)
    .start()
    .result((err, res) => {
      _.chain(res)
        .map((data, name) => {
          return {
            name: name,
            mean: data.average
          };
        })
        .sortBy('mean')
        .forEach((data, index, array) => {
          var name = data.name;
          var mean = data.mean;
          var diff = (_.first(array).mean) / mean;
          console.log('[%d] "%s" %sμs[%s]', ++index, name, mean.toPrecision(3), diff.toPrecision(3));
        })
        .value();
      next();
    });
});
