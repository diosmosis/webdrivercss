'use strict';

/**
 * compare images
 */

var resemble = require('node-resemble-js');

// TODO: removed saveImages flag as it seemed a hacky way to optimize behavior (was very hard to figure out)
//       what it was for, and where it should be set. apparently, it is to avoid doing local comparisons when
//       using applitools.
module.exports = async function() {
    /**
     * if there is no need for image comparison or no images gets saved on fs, just continue
     */
    if(!this.isComparable) {
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
