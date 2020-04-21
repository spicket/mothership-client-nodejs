# mothership-client

[![Greenkeeper badge](https://badges.greenkeeper.io/spicket/mothership-client-nodejs.svg)](https://greenkeeper.io/)

The official Node.js client for [Mothership](https://mothership.cloud).

## Installation
```
npm i mothership-client
```

## Requirements
- Node.js >= 8.x

## Usage

> If you're upgrading from v1.x or v2.x, see the [upgrading](#upgrading) section at the bottom of this doc.

Since most configuration values are needed during intial bootstrap of an app, this
module should probably be one of the first things your code requires.

Require the module, then initialize it using your environment key.

```
const mothership = require('mothership-client');
const config = await mothership.init('<config-key>');
```

or, set the `MOTHERSHIP_KEY` environment variable:

```
MOTHERSHIP_KEY=my_key
...
const config = await mothership.init();
```

Then simply reference your config like: `config.get('someKey')`;

When you need config in another module, simply require the module and call `mothership.get('anotherKey')`:

```
const config = require('mothership-client').get('anotherKey);
```

The Mothership client uses `lodash` dotted-notation syntax for fetching keys, and even allows specifying a default value if the key isn't found:

```
const subConfig = mothership.get('some.sub.key', 'sensible default');
```

You can grab the entire config at once; however, we don't recommend doing this, as Mothership will refresh the config periodically, so you could end up with stale values.

### Loading the config key from a file / secret
Given the rise of Kubernetes, there are cases where you may want to provide the Mothership config key via a mounted secret rather than as a string value or environment variable. In such a case, simply tell Mothership where to find the secret file on disk via either:

```
const config = await mothership.init({ keyPath: '/absolute/path/to/secret/file' });
```

or using the environment variable

```
MOTHERSHIP_KEY_PATH=/absolute/path/to/secret/file
```

Mothership will use the contents of the file as the key during initialization.

### Configuration auto-refresh
By default, Mothership auto-refreshes the local configuration cache every ten minutes. This ensures that changes made from the Mothership dashboard will propagate to connected applications.

If you want to adjust the refresh frequency, provide the desired frequency (in seconds) as an option during initialization:

```
const config = await mothership.init({ refreshInterval: 60 });
```

For more info, see [our documentation](https://docs.mothership.cloud).

## Upgrading

### To v3.x
Version 3.x removes the synchronous mode entirely. Calling `init()` returns a Promise that resolves when the config is loaded (e.g. `await mothership.init('config-key')`). If you need synchronous mode, stick with v2.x. Though, do [drop us a line](https://support.mothership.cloud) so we can better understand your use-case!

### To v2.x
The release of v2.x enables both synchronous and asynchronus modes of operation. v1.x only supported synchronous mode, which was incompatible with some platforms.

Async mode is now the default, returning a promise from the `init()` method.

If you want to use sync mode, pass a second argument during initialization:

```
const config = mothership.init('<config-key>', { sync: true });
```