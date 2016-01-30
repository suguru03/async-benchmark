'use strict';

const path = require('path');

const _ = require('lodash');
const async = require('neo-async');
const git = require('gulp-git');
const gulp = require('gulp');
const rimraf = require('rimraf');

const config = require('../config');

gulp.task('init', (done) => {

  const keys = ['neo-async'];
  const keyPath = _.map(keys, (key) => {
    return path.resolve(__dirname, '..', '..', key);
  });
  async.angelFall([

    async.apply(async.map, keyPath, (key, next) => {
      rimraf(key, next);
    }),

    async.apply(git.clone, config.repository['neo-async'])
  ], done);
});
