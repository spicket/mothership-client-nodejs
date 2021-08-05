const test = require('ava');
const path = require('path');
const delay = require('delay');

process.env.MOTHERSHIP_BASE_URL = 'http://localhost:3030';
const client = require('../');

const fork = require('child_process').fork;
var server = fork(__dirname + '/helpers/internal-server', { stdio: 'inherit' });

test.before(t => {
    return new Promise(resolve => {
        server.send('start');
        server.on('message', m => {
            t.log(`Got server message: ${m}`);
            if (m === 'started') {
                resolve();
            }
        });

    });
});

test.serial('Retrieve a good config on init', async t => {
    t.plan(1);

    let config = await client.init({
        key: 'good-config-key'
    });

    t.is(config.get('someKey'), 'someVal');
});

test.serial('Retrieve the entire config', async t => {
    t.plan(1);

    await client.init('good-config-key');

    let config = client.get();

    t.is(config.someKey, 'someVal');
});

test.serial('Don\'t throw if config fetch fails, but one is in cache', async t => {
    t.plan(1);

    try {
        await client._fetchConfig('/bad/url', {});
        let config = client.get();
        t.is(config.someKey, 'someVal');
    } catch (err) {
        t.fail(err);
    }
});

test.serial('Throw on a bad config key', async t => {
    t.plan(2);
    
    await t.throwsAsync(async () => client.init('bad-config-key'));
    
    t.throws(client.get);
});

test.serial('Get config sub-key using dotted-notation', async t => {
    t.plan(1);

    await client.init('good-config-key');

    t.is(client.get('some.sub.key'), 'a subkey');
});

test.serial('Get auth key from file', async t => {
    t.plan(1);

    let keyPath = path.resolve(path.join(__dirname, './helpers/secret_key_file'));
    t.log(keyPath);
    await client.init({ keyPath });

    t.notThrows(client.get);
});

test.serial('Handle missing auth key file', async t => {
    t.plan(1);

    let keyPath = path.resolve(path.join(__dirname, './helpers/missing_key_file'));
    await t.throwsAsync(async () => await client.init({ keyPath }));
});

test.serial('Refresh config periodically', async t => {
    t.plan(1);

    await client.init({
        key: 'good-config-key',
        refreshInterval: 10 // seconds
    });

    let firstTs = client.get('timestamp');

    t.timeout(50000);   // ms
    await delay(12000);
    t.true(client.get('timestamp') > firstTs);    
});

test.after.always(t => {
    t.log('Stopping server');
    server.send('stop');
});
