# minconf

`minconf` is a minimal configuration library.

`minconf` loads an application's configuration based on the value of an
environment variable, e.g. `NODE_ENV`. `minconf` supports merging of
environment variables and command line arguments.


## Configuration

Define environment configurations as objects or in files.

    var configs = {
      _options: {
        development: 'common config.local.json ARGV ENV',
        test: 'common test ARGV ENV',
        production: 'common production ARGV ENV'
      },

      common: {
        database: {
          user: 'superuser'
          password: 'password'
        }
      },

      test: {
        database: {
          password: 'secret'
        }
      },

      production = require('./config-production.json')
    };

Configure `minconf`. In this example, the environment is chosen based on the
value of `NODE_ENV` environment variable. If `NODE_ENV` is not set, it defaults to `'development'`.

    var config = MinConf.load(configs).config;

When running in `development`

    assert.equal(config.database.user, 'superuser');
    assert.equal(config.database.password, 'password');

When running in `NODE_ENV=test`

    assert.equal(config.database.user, 'superuser');
    assert.equal(config.database.password, 'secret');

### Merging Precendence

Merging occurs left to right. In this example,

    development: 'common config.local.json ARGV ENV'

The base opbject is `common`, then overriden by a file `config.local.json`, then overridden by `ARGV`,
which are the command line arguments and then overriden by `ENV`, which are the process environment
variables. In other words, environment variables override command line arguments which override a
local configuration file which overrides the base object.

WARNING: Avoid merging environment variables. Environment variables can be affected
by parent process or other init scripts.


### Overriding Selector

To override the environment variable seletor and default enviroment, set
`_options._selector` and `_options._default` respectively

    var configs = {
        _options: {
            _selector: 'NODE_ENV',
            _default: 'developoment'
        }
    }


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
