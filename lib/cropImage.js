'use strict';

/**
 * crop image according to user arguments and its position on screen and save it
 */

var gm = require('gm'),
    promisify = require('es6-promisify'),
    request = require('request-promise'),
    exclude = require('./exclude.js'),
    fs = require('fs');

const writeFile = promisify(fs.writeFile)

module.exports = async function(pageInfo) {
    var that = this,
        excludeRect = pageInfo.excludeRect,
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
            x: x - pageInfo.scrollPos.x,
            y: y - pageInfo.scrollPos.y,
            width: width,
            height: height
        };

        exclude(shot, excludeRect);
        shot.crop(cropDim.width, cropDim.height, cropDim.x, cropDim.y);

    } else if (pageInfo && pageInfo.elemBounding) {

        /**
         * or use boundary of specific CSS element
         */
        cropDim = {
            x: pageInfo.elemBounding.left + (pageInfo.elemBounding.width / 2),
            y: pageInfo.elemBounding.top + (pageInfo.elemBounding.height / 2),
            width: isNaN(width) ? pageInfo.elemBounding.width : width,
            height: isNaN(height) ? pageInfo.elemBounding.height : height
        };

        exclude(shot, excludeRect);
        shot.crop(cropDim.width, cropDim.height, cropDim.x - (cropDim.width / 2), cropDim.y - (cropDim.height / 2));
    } else {
        exclude(shot, excludeRect);
    }

    /**
     * generate image buffer
     */
    const buffer = await promisify(shot.toBuffer.bind(shot))()

    /**
     * save image to fs
     */
    await writeFile(this.filename || this.baselinePath, buffer);

    /**
     * upload image to applitools
     */
    var cb = arguments[arguments.length - 1];
    if (!this.self.options.usesApplitools) {
        return;
    }

    await request({
        qs: {apiKey: this.applitools.apiKey},
        url: this.applitools.host + '/api/sessions/running/' + this.self.sessionId,
        method: 'POST',
        headers: this.self.headers,
        timeout: this.self.reqTimeout,
        json: {
            'appOutput': {
                'title': pageInfo.title,
                'screenshot64': new Buffer(buffer).toString('base64')
            },
            'tag': this.currentArgs.tag || '',
            'ignoreMismatch': this.currentArgs.ignoreMismatch || false
        }
    });
};
