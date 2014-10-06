'use strict';
var assert = require('assert');
var Minconf = require('..');

describe('minconf', function() {

  describe('merging and overriding', function() {

    it('should read properties', function() {
      var config = new Minconf().set('development', {x: 1}).config;
      assert.equal(config.x, 1);
    });

    it('should merge values', function() {
      var config = new Minconf().set('development', {x: 1, y: 1 }, {y: 2, z: 1}).config;
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

      var config = new Minconf().set('development', common, staging).config;
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

      var config = new Minconf().set('development', common, staging).config;
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
      var config = new Minconf('MINICONF_ENV', 'dev')
        .set('dev', {x: 1})
        .set('staging', {x: 2})
        .config;
      assert.equal(config.x, 1);
    });

    it('should use value of environment variable', function() {
      process.env.MINICONF_ENV = 'staging';
      var config = new Minconf('MINICONF_ENV', 'dev')
        .set('dev', {x: 1})
        .set('staging', {x: 2})
        .config;
      assert.equal(config.x, 2);
    });

    it('should allow use of specific environment', function() {
      var config = new Minconf(null, 't').set('t', {x: 1}).config;
      assert.equal(config.x, 1);
    });
  });

  describe('objects', function() {
    it('should merge 1 or more argument objects', function() {
      var config = new Minconf()
        .set('development', {x: 1}, {y: 2})
        .config;
      assert.equal(config.x, 1);
      assert.equal(config.y, 2);
    });

    it('should merge an array of objects', function() {
      var config = new Minconf()
        .set('development', [{x: 1}, {y: 2}])
        .config;
      assert.equal(config.x, 1);
      assert.equal(config.y, 2);
    });

    it('can merge environment and command line args', function() {
      var config = new Minconf()
        .set('development', {x: 1}, {y: 2})
        .set('staging', {x: 2}, {y: 3})
        .merge(Minconf.env(), Minconf.argv())
        .config;
      assert.equal(config.x, 1);
      assert.equal(config.y, 2);
      assert.equal(config.ui, 'bdd');
      process.env.ui = undefined;
    });

    it('can use dotted names in process.env', function() {
      process.env['MINCONF.db.pass'] = 'secret';
      var config = new Minconf()
        .set('development', {x: 1}, {y: 2})
        .set('staging', {x: 2}, {y: 3})
        .merge(Minconf.env(), Minconf.argv())
        .config;
      assert.equal(config.x, 1);
      assert.equal(config.y, 2);
      assert.equal(config.ui, 'bdd');
      assert.equal(config.MINCONF.db.pass, 'secret');
      delete process.env['MINCONF.db.pass'];
    });

    it('can do simple load', function() {
      var config = {
        $: {
          envs: {
            development: 'common ARGV ENV',
            test: 'common test ARGV ENV',
            production: 'common production ARGV ENV'
          }
        },

        common: {
          name: 'foo'
        },
        test: {
          name: 'bar'
        },
        production: {
          name: 'bah'
        }
      };
      var c = Minconf.load(config).config;
      assert.equal(c.name, 'foo');
    });

    it('can do load with overrides', function() {
      var config = {
        $: {
          options: {
            envSelector: 'FOO_ENV',
            defaultEnv: 'test',
            wd: __dirname
          },

          envs: {
            development: 'common config.local.json ARGV ENV',
            test: 'common test ARGV ENV',
            production: 'common production ARGV ENV'
          }
        },


        common: {
          name: 'foo'
        },
        test: {
          name: 'bar'
        },
        production: {
          name: 'bah'
        }
      };

      // use default
      delete process.env.FOO_ENV;
      var c = Minconf.load(config).config;
      assert.equal(c.name, 'bar');

      // use development
      process.env.FOO_ENV = 'development';
      var c2 = Minconf.load(config).config;
      assert.equal(c2.name, 'local');

      // switch config based on environment
      process.env.FOO_ENV = 'production';
      var c3 = Minconf.load(config).config;
      assert.equal(c3.name, 'bah');
      delete process.env.FOO_ENV;
    });
  });
});
