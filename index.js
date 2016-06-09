'use strict';

const _ = require('lodash');

const args = _.get(global, 'argv', _.slice(process.argv, 2));
const argv = require('minimist')(args);

const benchmark = argv.b || argv.benchmark; // ['benchmark', 'func-comparator'], -b func-comparator
const times = argv.times;
const count = argv.c || argv.count;
const target = argv.t || argv.target; // -t <function name>
const funcExp = argv.f || argv.functions; // -f '(.*)current|neo-async*'

console.log('======================================');
const benchmarks = _.chain([
  'benchmark',
  'func-comparator'
])
.filter((name) => {
  return benchmark ? RegExp(benchmark).test(name) : name;
})
.transform((result, name) => {
  console.log(name);
  result[name] = require('./lib/'  + name);
}, {})
.value();

const async = require('./neo-async');
const functions = (() => {
  let funcs = {
    'async_pre': (() => {
      let _async = require('async');
      _async.VERSION = require('async/package.json').version;
      return _async;
    })(),
    'async_current': (() => {
      let _async = require('./async');
      _async.VERSION = require('./async/package.json').version;
      return _async;
    })(),
    'neo-async_pre': require('neo-async'),
    'neo-async_current': async
  };
  let exp = new RegExp(funcExp || '(.*)');
  return _.pickBy(funcs, (func, key) => {
    return exp.test(key);
  });
})();

console.log('======================================');
_.forOwn(functions, (obj, key) => {
  console.log('[%s], v%s', key, obj.VERSION);
});

const config = require('./config');
const defaults = config.defaults;
let tasks = _.omit(config, 'defaults');
if (target) {
  let exp = new RegExp('^' + target + '$');
  tasks = _.pickBy(tasks, (obj, name) => {
    return exp.test(name) || exp.test(_.first(name.split(':')));
  });
}

async.eachSeries(tasks, (task, name, done) => {
  let avaiable = task.avaiable === undefined ? defaults.avaiable : task.avaiable;
  if (!avaiable) {
    return done();
  }
  let _count = count || _.get(task, 'count', defaults.count);
  let _times = times || _.get(task, 'times', defaults.times);
  let setup = _.get(task, 'setup', _.noop);

  setup(_count);

  console.log('======================================');
  console.log('[' + name + '] Comparating... ');

  let func = _.get(task, 'func', defaults.func);
  async.eachSeries(benchmarks, (benchmarker, benchmark, next) => {
    let funcs = _.mapValues(functions, (async) => {
      return (callback) => {
        func(async, callback);
      };
    });
    console.log('--------------------------------------');
    console.log('[%s] Executing...', benchmark);
    benchmarker(funcs, _times)((err, res) => {
      if (err) {
        return next(err);
      }
      _.forEach(res, (data, index, array) => {
        let name = data.name;
        let mean = data.mean;
        let diff = (_.first(array).mean) / mean;
        let rate = mean / (_.first(array).mean);
        console.log('[%d] "%s" %sμs[%s][%s]', ++index, name, mean.toPrecision(3), diff.toPrecision(3), rate.toPrecision(3));
      });
      next();
    });
  }, done);
});
