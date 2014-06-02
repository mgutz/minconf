# minconf

`minconf` is a minimal configuration library.

`minconf` loads an application's configuration based on the value of an
environment variable, e.g. `NODE_ENV`. `minconf` supports merging of
environment variables and command line arguments.


## Configuration

Define environment configurations as objects or in files.

    var configs = {
      common: {
        database: {
          user: 'superuser'
          password: 'password'
        }
      },

      staging: {
        database: {
          password: 'secret'
        }
      },

      production = require('./config-production.json')
    };

Configure `minconf`. In this example, the environment is chosen based on the
value of `NODE_ENV` environment variable. If `NODE_ENV` is not set, use `'development'`
configuration.

    var MinConf = require('minconf');
    var config = new MinConf('NODE_ENV', 'development')
      // Environments are merged values of one or more objects. Only the current
      // the current environment is loaded.
      .set('development', configs.common)
      .set('staging', configs.common, configs.staging)
      .set('release', configs.common', configs.production)

      // Merge command line arguments via [minimist](https://github.com/substack/minimist)
      .merge(MinConf.argv())
      .config;

When running in `development`

    assert.equal(config.database.user, 'superuser');
    assert.equal(config.database.password, 'password');

When running in `staging`

    assert.equal(config.database.user, 'superuser');
    assert.equal(config.database.password, 'secret');

### Merging Precendence

Precendence increases left to right. In this example,

    set('development', {x: 1}).merge(MinConf.env(), MinConf.argv())

The `x` value is set to 1, then overridden by `env` then overriden by `argv`.
In other words, command line arguments override environment variables and
configuration files/objects.

WARNING: Avoid merging environment variables. Environment variables can be affected
by parent process or other init scripts.


## Running your app

Use any combination of config files, environment variables and command line
arguments.

    NODE_ENV=test node app.js --db.password='secret'

Use `env` command to use periods in environment variables. It is recommended
to use command line arguments instead.

    env 'db.user=foo' 'db.pass=secret' node app.js


## License

The MIT License

Copyright (c) 2014 Mario Gutierrez <mario@mgutz.com>

See the file [LICENSE](LICENSE) for copying permissions.
