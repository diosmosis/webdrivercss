'use strict';

var pkg = require('../package.json'),
    request = require('request-promise'),
    WebdriverIO = require('webdriverio');

module.exports = async function() {
    /**
     * skip when not using applitools
     */
    if(!this.self.options.usesApplitools || this.self.sessionId) {
        return;
    }
    /**
     * get meta information of current session
     */
    let res = await this.instance.execute(function() {
        return {
            useragent: navigator.userAgent,
            screenWidth: Math.max(document.documentElement.clientWidth, window.innerWidth || 0),
            documentHeight: document.documentElement.scrollHeight
        };
    })

    this.useragent = res.value.useragent;
    this.displaySize = {
        width: this.screenWidth && this.screenWidth.length ? this.screenWidth[0] : res.value.screenWidth,
        height: res.value.documentHeight
    };

    /**
     * initialise applitools session
     */
    res = await request({
        url: this.applitools.host + '/api/sessions/running',
        qs: {apiKey: this.applitools.apiKey},
        method: 'POST',
        json: {
            'startInfo': {
                'envName': this.applitools.baselineName,
                'appIdOrName': this.applitools.appName,
                'scenarioIdOrName': this.currentArgs.name,
                'batchInfo': {
                    'id': this.applitools.batchId,
                    'name': this.pagename,
                    'startedAt': new Date().toISOString()
                },
                'environment': {
                    'displaySize': this.displaySize,
                    'inferred': 'useragent:' + this.useragent
                },
                'matchLevel': 'Strict',
                'agentId': pkg.name + '/' + pkg.version
            }
        },
        headers: this.self.headers,
        timeout: this.self.reqTimeout,
        resolveWithFullResponse: true,
        simple: false,
    });

    if (res.statusCode !== 200 && res.statusCode !== 201) {
        throw new Error('Couldn\'t start applitools session');
    }

    this.self.sessionId = res.body.id;
    this.self.url = res.body.url;
    this.self.isNew = res.statusCode === 201;
};
