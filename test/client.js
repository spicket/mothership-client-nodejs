const test = require('ava');

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

test('(sync) Retrieve a good config on init', t => {
    t.plan(1);

    let config = client.init({
        key: 'good-config-key'
    }, { sync: true });

    t.is(config.someKey, 'someVal');
});

test('(sync) Retrieve a good config', t => {
    t.plan(1);

    client.init('good-config-key', { sync: true });

    let config = client.get();

    t.is(config.someKey, 'someVal');
});

test('(sync) Throw on a bad config key', t => {
    t.plan(2);
    
    t.throws(() => {
        client.init('bad-config-key', { sync: true });
    });
    
    t.is(client.get(), null);
});

test('(async) Retrieve a good config on init', async t => {
    t.plan(1);

    let config = await client.init({
        key: 'good-config-key'
    });

    t.is(config.someKey, 'someVal');
});

test('(async) Retrieve a good config', async t => {
    t.plan(1);

    await client.init('good-config-key');

    let config = client.get();

    t.is(config.someKey, 'someVal');
});

test.serial('(async) Throw on a bad config key', async t => {
    t.plan(2);
    
    await t.throwsAsync(async () => {
        await client.init('bad-config-key');
    });
    
    t.is(client.get(), null);
});

test('Get config sub-key using dotted-notation', async t => {
    t.plan(1);

    await client.init('good-config-key');

    t.is(client.get('some.sub.key'), 'a subkey');
})

test.after.always(t => {
    t.log('Stopping server');
    server.send('stop');
});
