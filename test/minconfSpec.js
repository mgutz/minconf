'use strict';
var assert = require('assert');
var Config = require('..');

describe('minconf', function() {

  describe('merging and overriding', function() {

    it('should read properties', function() {
      var config = new Config().set('development', {x: 1}).config;
      assert.equal(config.x, 1);
    });

    it('should merge values', function() {
      var config = new Config().set('development', {x: 1, y: 1 }, {y: 2, z: 1}).config;
      assert.equal(config.x, 1);
      assert.equal(config.y, 2);
      assert.equal(config.z, 1);
    });

    it('should replace hierarchical values', function() {
      var common = {
        parent: {
          sub: {
            a: 0,
            sub: { x : 1 }}}};
      var staging = {
        parent: {
          sub: {
            a: 10,
            sub: { y: 2 }}}};

      var config = new Config().set('development', common, staging).config;
      assert.equal(config.parent.sub.a, 10);
      assert.equal(config.parent.sub.sub.x, 1);
      assert.equal(config.parent.sub.sub.y, 2);
    });

    it('should replace hierarchical array values', function() {
      var common = {
        parent: {
          sub: {
            array: [1,2],
            sub: { x : 1 }}}};
      var staging = {
        parent: {
          sub: {
            array: [100, 200],
            sub: { y: 2 }}}};

      var config = new Config().set('development', common, staging).config;
      assert.equal(config.parent.sub.array[0], 100);
      assert.equal(config.parent.sub.array[1], 200);
      assert.equal(config.parent.sub.sub.x, 1);
      assert.equal(config.parent.sub.sub.y, 2);
    });
  });


  describe('environment variables', function() {

    // MINICONF_ENV is used for testing instead of the default NODE_ENV

    it('should use default option if environment variable is not set', function() {
      delete process.env.MINICONF_ENV;
      var config = new Config('MINICONF_ENV', 'dev')
        .set('dev', {x: 1})
        .set('staging', {x: 2})
        .config;
      assert.equal(config.x, 1);
    });

    it('should use value of environment variable', function() {
      process.env.MINICONF_ENV = 'staging';
      var config = new Config('MINICONF_ENV', 'dev')
        .set('dev', {x: 1})
        .set('staging', {x: 2})
        .config;
      assert.equal(config.x, 2);
    });

    it('should allow use of specific environment', function() {
      var config = new Config(null, 't').set('t', {x: 1}).config;
      assert.equal(config.x, 1);
    });
  });

  describe('objects', function() {
    it('should merge 1 or more argument objects', function() {
      var config = new Config()
        .set('development', {x: 1}, {y: 2})
        .config;
      assert.equal(config.x, 1);
      assert.equal(config.y, 2);
    });

    it('should merge an array of objects', function() {
      var config = new Config()
        .set('development', [{x: 1}, {y: 2}])
        .config;
      assert.equal(config.x, 1);
      assert.equal(config.y, 2);
    });

    it('can merge environment and command line args', function() {
      var config = new Config()
        .set('development', {x: 1}, {y: 2})
        .set('staging', {x: 2}, {y: 3})
        .merge(Config.env(), Config.argv())
        .config;
      assert.equal(config.x, 1);
      assert.equal(config.y, 2);
      assert.equal(config.ui, 'bdd');
    });

    it('can use dotted names in process.env', function() {
      process.env['MINCONF.db.pass'] = 'secret';
      var config = new Config()
        .set('development', {x: 1}, {y: 2})
        .set('staging', {x: 2}, {y: 3})
        .merge(Config.env(), Config.argv())
        .config;
      assert.equal(config.x, 1);
      assert.equal(config.y, 2);
      assert.equal(config.ui, 'bdd');
      assert.equal(config.MINCONF.db.pass, 'secret');
      delete process.env['MINCONF.db.pass'];
    });

  });
});

