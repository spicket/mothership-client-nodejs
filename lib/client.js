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

    let configUrl = `${MOTHERHIP_BASE_URL}/api/configs/retrieve`;
    let configHeaders = {
        'X-Config-Key': key
    };

    await fetchConfig(configUrl, configHeaders);
    setInterval(fetchConfig, refreshIntervalSecs * 1000, configUrl, configHeaders);

    return { get };
}

async function fetchConfig(url, headers) {
    try {
        let resp = await asyncRequest.get(url, { headers });
        config = resp.body;
    } catch (err) {
        configError(err);
    }
}

function configError(err) {
    debug('Failed to load or parse an updated config from the remote server:', err);

    // Only throw if there's no previous config so we don't crash the app.
    if (!config) {
        throw new Error(`Failed to load or parse config: ${err.message}`);
    }
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
    _fetchConfig: fetchConfig,
};