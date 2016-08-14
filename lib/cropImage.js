'use strict';

/**
 * crop image according to user arguments and its position on screen and save it
 */

var gm = require('gm'),
    async = require('async'),
    request = require('request'),
    exclude = require('./exclude.js');

module.exports = function(res, done) {
  console.log(require('path').basename(__filename));
    var that = this,
        excludeRect = res.excludeRect,
        shot = gm(this.screenshot).quality(100),
        cropDim;

    var x = parseInt(this.currentArgs.x, 10);
    var y = parseInt(this.currentArgs.y, 10);
    var width = parseInt(this.currentArgs.width, 10);
    var height = parseInt(this.currentArgs.height, 10);

    shot.setFormat('png');

    if (!isNaN(x) && !isNaN(y) && !isNaN(width) && !isNaN(height)) {

        /**
         * crop image with given arguments
         */
        cropDim = {
            x: x - res.scrollPos.x,
            y: y - res.scrollPos.y,
            width: width,
            height: height
        };

        exclude(shot, excludeRect);
        shot.crop(cropDim.width, cropDim.height, cropDim.x, cropDim.y);

    } else if (res && res.elemBounding) {

        /**
         * or use boundary of specific CSS element
         */
        cropDim = {
            x: res.elemBounding.left + (res.elemBounding.width / 2),
            y: res.elemBounding.top + (res.elemBounding.height / 2),
            width: isNaN(width) ? res.elemBounding.width : width,
            height: isNaN(height) ? res.elemBounding.height : height
        };

        exclude(shot, excludeRect);
        shot.crop(cropDim.width, cropDim.height, cropDim.x - (cropDim.width / 2), cropDim.y - (cropDim.height / 2));
    } else {
        exclude(shot, excludeRect);
    }

    async.waterfall([
        /**
         * generate image buffer
         */
        function() {
            var cb = arguments[arguments.length - 1];
            return shot.toBuffer(cb);
        },
        /**
         * save image to fs
         */
        function(buffer, cb) {
            if(!that.saveImages) {
                return cb();
            }

            fs.writeFile(that.filename || that.baselinePath, buffer, cb);
        },
        /**
         * upload image to applitools
         */
        function(buffer) {
            var cb = arguments[arguments.length - 1];
            if (!that.self.options.usesApplitools) {
                return cb();
            }
            request({
                qs: {apiKey: that.applitools.apiKey},
                url: that.applitools.host + '/api/sessions/running/' + that.self.sessionId,
                method: 'POST',
                headers: that.self.headers,
                timeout: that.self.reqTimeout,
                json: {
                    'appOutput': {
                        'title': res.title,
                        'screenshot64': new Buffer(buffer).toString('base64')
                    },
                    'tag': that.currentArgs.tag || '',
                    'ignoreMismatch': that.currentArgs.ignoreMismatch || false
                }
            }, cb);
        }
    ], done);

};
