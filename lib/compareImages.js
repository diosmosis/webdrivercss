'use strict';

/**
 * compare images
 */

var resemble = require('node-resemble-js');

module.exports = async function() {
    /**
     * if there is no need for image comparison or no images gets saved on fs, just continue
     */
    if(!this.isComparable || !this.self.options.saveImages) {
        return
    }

    /**
     * compare images
     */
    var diff = resemble(this.baselinePath).compareTo(this.regressionPath);

    /**
     * map 'ignore' configuration to resemble options
     */
    var ignore = this.currentArgs.ignore || "";
    if (ignore.indexOf("color") === 0) {
        diff.ignoreColors();
    } else if (ignore.indexOf("antialias") === 0) {
        diff.ignoreAntialiasing();
    }

    /**
     * execute the comparison
     */
    await new Promise((resolve) => diff.onComplete(resolve))
};
