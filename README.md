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

> If you're upgrading from v1.x, see the [upgrading](#upgrading) section at the bottom of this doc.

Since most configuration values are needed during intial bootstrap of an app, this
module should probably be one of the first things your code requires.

Require the module, then initialize it using your environment key.

```
const mothership = require('mothership-client');
const config = mothership.init('<config-key>');
```

Then simply reference your config like: `config.someKey`;

When you need config in another module, simply require the module and call `get()`:

```
const config = require('mothership-client').get();
```

Or, if you want a specific portion of the config object, you can use `lodash` dotted-notation syntax, and even specify a default if the key isn't found:

```
const subConfig = mothership.get('some.sub.key', 'sensible default');
```

For more info, see [our documentation](https://docs.mothership.cloud).

## Upgrading

### To v2.x
The release of v2.x enables both synchronous and asynchronus modes of operation. v1.x only supported synchronous mode, which was incompatible with some platforms.

Async mode is now the default, returning a promise from the `init()` method.

If you want to use sync mode, pass a second argument during initialization:

```
const config = mothership.init('<config-key>', { sync: true });
```