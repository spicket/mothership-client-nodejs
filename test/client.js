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

test('Retrieve a good config', t => {
    t.plan(1);

    client.init({
        key: 'good-config-key'
    });

    let config = client.get();

    t.is(config.someKey, 'someVal');
});

test('Throw on a bad config key', t => {
    t.plan(2);
    
    t.throws(() => {
        client.init({
            key: 'bad-config-key'
        });
    });
    
    t.is(client.get(), null);
});

test.after.always(t => {
    t.log('Stopping server');
    server.send('stop');
});
