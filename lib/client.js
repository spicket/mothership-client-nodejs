const request = require('sync-request');
const debug = require('debug')('mothership:client');

const MOTHERHIP_BASE_URL = process.env.MOTHERSHIP_BASE_URL || 'https://app.mothership.cloud';

let config;

function init(opts) {
    let { key, env } = opts;
    let configUrl = `${MOTHERHIP_BASE_URL}/api/configs/retrieve`;

    // Ensure we don't have a config already
    config = null;

    try {
        let resp = request('GET', configUrl, {
            headers: {
                'X-Config-Key': key
            }
        });

        return config = JSON.parse(resp.getBody('utf-8'));
    } catch (err) {
        debug('Failed to load or parse config', err);
        throw new Error(`Failed to load or parse config: ${err.message}`);
    }


}

function get() {
    return config;
}

module.exports = {
    init,
    get,
};
