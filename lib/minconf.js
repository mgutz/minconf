'use strict';
var slice = [].slice;
var extend = require('./extend');
var npath = require('path');

/**
 * Loads an environment configuration based on the value of an environment
 * variable.
 *
 * @param {String} envVariable Name of environment variable to use. If null
 *                             then the second argument is the config
 *                             name to use. Recommend 'NODE_ENV'.
 * @param {String} defaultEnv The  environment to use if environment
 *                            variable is not set or null.
 */
function MinConf(envVariable, defaultEnv) {
  if (!defaultEnv) {
    defaultEnv = 'development';
    if (!envVariable) {
      envVariable = 'NODE_ENV';
    }
  }
  this.currentEnv = process.env[envVariable] || defaultEnv;
  this.config = {};
}

/**
 * Sets an environment configuration IF the environment variable's
 * value matches name.
 *
 * @param {String} env The environment to set.
 * @param {Array|Object} objects An array of objects or objects as arguments.
 */
MinConf.prototype.set = function(env, objects) {
  if (!env) throw new Error('Missing required argument: env = environment name');
  if (!objects) throw new Error('Missing required argument: objects');

  if (!(objects instanceof Array)) {
    objects = slice.call(arguments, 1);
  }

  // only load the current environment
  if (this.currentEnv !== env) return this;

  if (!objects) throw new Error('One or more objects required');

  var i, object, length = objects.length;
  for (i = 0; i < length; i++) {
    object = objects[i];
    extend.deepExtend(this.config, object);
  }
  return this;
};

/**
 * Merge objects into the current environment.
 *
 * @param objects {Array[Object]|Object} Array of objects or objects as arguments.
 */
MinConf.prototype.merge = function(objects) {
  if (!(objects instanceof Array)) {
    objects = slice.call(arguments, 0);
  }
  return this.set(this.currentEnv, objects);
};

/**
 * Gets command line arguments using minimist.
 */
var _argv = null;
MinConf.argv = function argv(offset) {
  if (!offset) offset = 2;
  if (!_argv) _argv = require('minimist')(process.argv.slice(offset));
  return _argv;
};

/**
 * Gets environment variable with support for dots '.'.
 */
MinConf.env = function env(offset) {
  var environmentVars = {};

  var root, k, parts, val, i, obj;
  for (k in process.env) {
    if (process.env.hasOwnProperty(k)) {
      val = process.env[k];
      root = environmentVars;

       // create nested objects, eg obj.foo.bar
      if (k.indexOf('.') > 0) {
        parts = k.split('.');
        for (i = 0; i < parts.length - 1; i++) {
          root = root[parts[i]] = {};
        }
        // last part is the key to set
        k = parts[i];
      }

      root[k] = val;
    }
  }
  return environmentVars;
};

MinConf.config = function uber(config) {
  var envs = config._envs;

  var mc = new MinConf(envs._selector || 'NODE_ENV', envs._default || 'development');
  for (var name in envs) {
    if (name === '_selector' || name === '_default') continue;

    var spec = envs[name];
    var parts = spec.split(" ");
    parts.forEach(function(part) {
      var values;
      if (part === 'ARGV') {
        values  = MinConf.argv();
      } else if (part === 'ENV') {
        values = process.env;
      } else if (config[part]) {
        values = config[part];
      } else {
        throw new Error('config[' + name + '] not found');
      }
      mc.set(name, values);
    });
  }

  return mc.config;
};


/**
 * Loads configuration file `config` with an optional `options`. `options` may
 * also be embedded as `_options` in `config`.
 *
 * @param {Object} config The configuration object.
 * @param {Object} options Configuration options.
 */
MinConf.load = function load(config, options) {
  if (!options) options = config._options;
  var cwd = options._cwd || process.cwd();

  var mc = new MinConf(options._selector || 'NODE_ENV', options._default || 'development');
  for (var name in options) {
    // skip minconf settings
    if (name === '_selector' || name === '_default' || name === '_cwd') continue;

    var spec = options[name];
    var parts = spec.split(" ");
    parts.forEach(function(part) {
      var values;
      if (part === 'ARGV') {
        values  = MinConf.argv();
      } else if (part === 'ENV') {
        values = process.env;
      } else if (part.match(/\.(js|json)$/)) {
        // a file which overrides settings
        values = require(npath.resolve(cwd, part));
      } else if (config[part]) {
        values = config[part];
      } else {
        throw new Error('config['  + name + '%s] not found');
      }
      mc.set(name, values);
    });
  }

  return mc;
};


module.exports = MinConf;
