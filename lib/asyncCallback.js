'use strict';

/**
 * run workflow again or execute callback function
 */

var workflow = require('./workflow.js'),
    endSession = require('./endSession.js');

module.exports = async function() {
    /**
     * on multiple screenWidth or multiple page elements
     * repeat workflow
     */
    if (this.screenWidth && this.screenWidth.length) {

        /**
         * if multiple screen widths are given
         * start workflow all over again with same parameter
         */
        this.queuedShots[0].screenWidth = this.screenWidth;
        return await workflow.call(this.self, this.pagename, this.queuedShots)
    } else if (this.queuedShots.length > 1) {
        /**
         * if multiple page modules are given
         */
        await endSession.call(this)

        this.queuedShots.shift();
        return await workflow.call(this.self, this.pagename, this.queuedShots);
    }

    /**
     * finish command
     */
    await endSession.call(this)

    this.self.takeScreenshot = undefined;

    const result = this.self.options.resultObject;
    this.self.options.resultObject = {};
    return result
};
