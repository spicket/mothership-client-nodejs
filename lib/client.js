const _get = require('lodash/get');
const got = require('got');
const debug = require('debug')('mothership:client');

const MOTHERHIP_BASE_URL = process.env.MOTHERSHIP_BASE_URL || 'https://app.mothership.cloud';

const syncRequest = require('sync-request');
const asyncRequest = got.extend({
    json: true
});

let config = null;

function init(key, opts) {
    if (typeof key === 'object') {
        key = key.key;
    }

    opts = {
        sync: false,
        ...opts 
    };

    // Ensure we don't re-use a previous config
    config = null;

    const configUrl = `${MOTHERHIP_BASE_URL}/api/configs/retrieve`;
    const headers = {
        'X-Config-Key': key
    };

    if (opts.sync) {
        return config = syncClient(configUrl, headers);
    }

    // Can't use async/await here, since function can be either sync or async
    return asyncClient(configUrl, headers).then(body => {
        return config = body;
    });
}

function syncClient(url, headers) {
    try {
        let resp = syncRequest('GET', url, { headers });
        return JSON.parse(resp.getBody('utf-8'));
    } catch (err) {
        configError(err);
    }
}

async function asyncClient(url, headers) {
    try {
        let resp = await asyncRequest.get(url, { headers });
        return resp.body;
    } catch (err) {
        configError(err);
    }
}

function configError(err) {
    debug('Failed to load or parse config', err);
    throw new Error(`Failed to load or parse config: ${err.message}`);
}

function get() {
    return config;
}

module.exports = {
    init,
    get,
};