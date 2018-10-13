# mothership-client

The official Node.js client for [Mothership](https://mothership.cloud).

## Installation
```
npm i mothership-client
```

## Requirements
- Node.js >= 8.x

## Usage
Since most configuration values are needed during intial bootstrap of an app, this
module should probably be one of the first things your code requires.

Require the module, then initialize it using your environment key.

```
const mothership = require('mothership-client');
const config = mothership.init({
    key: '<config-key>'
});
```

Then simply reference your config like: `config.someKey`;

When you need config in another module, simply require the module and call `get()`:

```
const config = require('mothership-client').get();
```

For more info, see [our documentation](https://docs.mothership.cloud).
