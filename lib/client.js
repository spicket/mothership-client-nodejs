const _get = require('lodash/get');
const got = require('got');
const debug = require('debug')('mothership:client');
const fs = require('fs');
const Util = require('util');

const readFileAsync = Util.promisify(fs.readFile);

const MOTHERHIP_BASE_URL = process.env.MOTHERSHIP_BASE_URL || 'https://app.mothership.cloud';

const asyncRequest = got.extend({
    json: true
});

let config = null;
let refreshIntervalSecs = 600; // 10 minutes (in seconds)

async function init(key, opts) {
    if (typeof key === 'object') {
        opts = key;
        key = opts.key;
    }

    opts = {
        ...opts 
    };

    if (process.env.MOTHERSHIP_KEY) {
        key = process.env.MOTHERSHIP_KEY;
    }

    // Load key from file if present
    if (opts.keyPath || process.env.MOTHERSHIP_KEY_PATH) {
        try {
            key = await readFileAsync(opts.keyPath || process.env.MOTHERSHIP_KEY_PATH);
        } catch (err) {
            configError(err)
        }
    }

    if (opts.refreshInterval) {
        refreshIntervalSecs = opts.refreshInterval;
    }

    // Ensure we don't re-use a previous config
    config = null;

    const configUrl = `${MOTHERHIP_BASE_URL}/api/configs/retrieve`;
    const headers = {
        'X-Config-Key': key
    };

    // Can't use async/await here, since function can be either sync or async
    await fetchConfig(configUrl, headers);

    return { get };
}

async function fetchConfig(url, headers) {
    try {
        let resp = await asyncRequest.get(url, { headers });
        config = resp.body;
    } catch (err) {
        configError(err);
    }

    setTimeout(fetchConfig.bind(null, url, headers), refreshIntervalSecs * 1000);
}

function configError(err) {
    debug('Failed to load or parse config', err);
    throw new Error(`Failed to load or parse config: ${err.message}`);
}

function get(path, defaultVal) {
    if (!config) {
        configError(new Error('Config not initialized. Please run init() first.'));
    }

    if (path) {
        return _get(config, path, defaultVal);
    }

    return config;
}

module.exports = {
    init,
    get,
};