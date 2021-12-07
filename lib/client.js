const _get = require('lodash/get');
const got = require('got');
const debug = require('debug')('mothership:client');
const fs = require('fs');
const Util = require('util');

const readFileAsync = Util.promisify(fs.readFile);

const MOTHERHIP_BASE_URL = process.env.MOTHERSHIP_BASE_URL || 'https://app.mothership.cloud';

const asyncRequest = got.extend({
    responseType: 'json'
});

let instance = new MothershipClient();

function MothershipClient(key, opts) {
    this.key = key;
    this.opts = opts;
    this.config = null;
    this.refreshIntervalSecs = 600; // 10 minutes (in seconds)

    this.init = async (key, opts) => {
        key = this.key || key;
        opts = this.opts || opts;
        if (typeof key === 'object') {
            opts = key;
            key = opts.key;
        }
    
        opts = {
            ...opts 
        };
    
        if (!key) {
            if (process.env.MOTHERSHIP_KEY) {
                key = process.env.MOTHERSHIP_KEY;
            }
            // Load key from file if present
            if (opts.keyPath || process.env.MOTHERSHIP_KEY_PATH) {
                try {
                    key = await readFileAsync(opts.keyPath || process.env.MOTHERSHIP_KEY_PATH);
                } catch (err) {
                    this.configError(err)
                }
            }
        }
    
        if (opts.refreshInterval) {
            this.refreshIntervalSecs = opts.refreshInterval;
        }
    
        let configUrl = `${MOTHERHIP_BASE_URL}/api/configs/retrieve`;
        let configHeaders = {
            'X-Config-Key': key
        };
    
        await this._fetchConfig(configUrl, configHeaders);
        setInterval(this._fetchConfig, this.refreshIntervalSecs * 1000, configUrl, configHeaders);

        this._initialized = true;
        return this;
    }

    this._fetchConfig = async (url, headers) => {
        try {
            let resp = await asyncRequest.get(url, { headers });
            this.config = resp.body;
        } catch (err) {
            this.configError(err);
        }
    }
    
    this.configError = (err) => {
        debug('Failed to load or parse an updated config from the remote server:', err);
    
        // Only throw if there's no previous config so we don't crash the app.
        if (!this.config) {
            throw new Error(`Failed to load or parse config: ${err.message}`);
        }
    }
    
    this.get = (path, defaultVal) => {
        if (!this.config) {
            this.configError(new Error('Config not initialized. Please run init() first.'));
        }
    
        if (path) {
            return _get(this.config, path, defaultVal);
        }
    
        return this.config;
    }

    return this;
}

module.exports = {
    init: async (key, opts) => {
        if (!instance._initialized) {
            return instance.init(key, opts);
        }
        let client = new MothershipClient(key, opts);
        await client.init();
        return client;
    },
    get: (path, defaultVal) => { return instance.get(path, defaultVal); },
    configError: (err) => { return instance.configError(err); },
    _fetchConfig: async (url, headers) => { return await instance._fetchConfig(url, headers); },
}
