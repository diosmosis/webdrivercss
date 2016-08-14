'use strict';

var merge = require('deepmerge'),
    request = require('request-promise');

module.exports = async function() {
    /**
     * if screenwidth was set, get back to old resolution
     */
    if (this.self.defaultScreenDimension) {
        await this.instance.windowHandleSize({
            width: this.self.defaultScreenDimension.width,
            height: this.self.defaultScreenDimension.height
        })
    }

    /**
     * end session when using applitools
     */
    if(this.self.options.usesApplitools) {
        // Whether or not we should automatically save this test as baseline.
        var updateBaseline = (this.self.isNew && this.applitools.saveNewTests) ||
                             (!this.self.isNew && this.applitools.saveFailedTests);

        const res = await request({
            qs: {apiKey: this.applitools.apiKey, updateBaseline: updateBaseline},
            url: this.applitools.host + '/api/sessions/running/' + this.self.sessionId,
            method: 'DELETE',
            headers: this.self.headers,
            timeout: this.self.reqTimeout,
            resolveWithFullResponse: true,
        });

        if (res.body) {
            this.self.options.resultObject[this.currentArgs.name] = merge({
                id: this.self.sessionId,
                url: this.self.url
            }, JSON.parse(res.body));
            this.self.url = undefined;
            this.self.sessionId = undefined;
            this.self.isNew = undefined;
        }
    }
};
