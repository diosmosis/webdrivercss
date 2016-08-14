'use strict';

var pkg = require('../package.json'),
    request = require('request'),
    async = require('async'),
    WebdriverIO = require('webdriverio');

module.exports = function() {
  console.log(require('path').basename(__filename));

    var that = this,
        done = arguments[arguments.length - 1];

    /**
     * skip when not using applitools
     */
    if(!this.self.options.usesApplitools || this.self.sessionId) {
        return done();
    }

    async.waterfall([

        /**
         * get meta information of current session
         */
        function(cb) {
            that.instance.execute(function() {
                return {
                    useragent: navigator.userAgent,
                    screenWidth: Math.max(document.documentElement.clientWidth, window.innerWidth || 0),
                    documentHeight: document.documentElement.scrollHeight
                };
            }).then(function(res) {
                that.useragent = res.value.useragent;
                that.displaySize = {
                    width: that.screenWidth && that.screenWidth.length ? that.screenWidth[0] : res.value.screenWidth,
                    height: res.value.documentHeight
                };

                return cb();
            }).catch(function (err) {
              cb(err);
            });
        },

        /**
         * initialise applitools session
         */
        function(cb) {
            request({
                url: that.applitools.host + '/api/sessions/running',
                qs: {apiKey: that.applitools.apiKey},
                method: 'POST',
                json: {
                    'startInfo': {
                        'envName': that.applitools.baselineName,
                        'appIdOrName': that.applitools.appName,
                        'scenarioIdOrName': that.currentArgs.name,
                        'batchInfo': {
                            'id': that.applitools.batchId,
                            'name': that.pagename,
                            'startedAt': new Date().toISOString()
                        },
                        'environment': {
                            'displaySize': that.displaySize,
                            'inferred': 'useragent:' + that.useragent
                        },
                        'matchLevel': 'Strict',
                        'agentId': pkg.name + '/' + pkg.version
                    }
                },
                headers: that.self.headers,
                timeout: that.self.reqTimeout
            }, cb);

        }
    ], function(err, res, body) {
        if (err) {
            return done(err);
        }

        if (res.statusCode !== 200 && res.statusCode !== 201) {
            return done(new Error('Couldn\'t start applitools session'));
        }

        that.self.sessionId = body.id;
        that.self.url = body.url;
        that.self.isNew = res.statusCode === 201;
        return done();

    });
};
