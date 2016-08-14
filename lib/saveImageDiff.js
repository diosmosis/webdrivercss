'use strict';

var fs = require('fs'),
    promisify = require('es6-promisify'),
    logWarning = require('./logWarning.js')

const rename = promisify(fs.rename)

module.exports = async function(imageDiff) {
    if (!imageDiff) {
        this.self.options.resultObject[this.currentArgs.name].push({
            baselinePath: this.baselinePath,
            message: 'first image of module "' + this.currentArgs.name + '" from page "' + this.pagename + '" successfully taken',
            misMatchPercentage: 0,
            isExactSameImage: true,
            isSameDimensions: true,
            isWithinMisMatchTolerance: true,
            properties: this.currentArgs
        });

        return;
    }

    var misMatchTolerance = parseFloat(imageDiff.misMatchPercentage,10);

    /**
     * if set misMatchTolerance is smaller then compared misMatchTolerance
     * make image diff
     */
    if(this.misMatchTolerance < misMatchTolerance) {

        /*istanbul ignore next*/
        if(!imageDiff.isSameDimensions) {
            logWarning.call(this.instance, 'DimensionWarning');
        }

        this.self.options.resultObject[this.currentArgs.name].push({
            baselinePath: this.baselinePath,
            regressionPath: this.regressionPath,
            diffPath: this.diffPath,
            message: 'mismatch tolerance exceeded (+' + (misMatchTolerance - this.misMatchTolerance) + '), image-diff created',
            misMatchPercentage: misMatchTolerance,
            isExactSameImage: false,
            isSameDimensions: imageDiff.isSameDimensions,
            isWithinMisMatchTolerance: false,
            properties: this.currentArgs
        });

        await new Promise((resolve) => {
          imageDiff.getDiffImage().pack()
              .on('end', () => resolve(this.resultObject))
              .pipe(fs.createWriteStream(this.diffPath));
        })

    } else {
        /**
         * otherwise delete diff
         */

        if (fs.existsSync(this.diffPath)) {
            fs.unlinkSync(this.diffPath);
         }

        /**
         * Save a new baseline image, if one doesn't already exist.
         *
         * If one does exist, we delete the temporary regression.
         */
        if (fs.existsSync(this.baselinePath)) {
          fs.unlinkSync(this.regressionPath)
        } else {
          rename(this.regressionPath, this.baselinePath)
        }

        /**
         * return result object to WebdriverIO instance
         */
        this.self.options.resultObject[this.currentArgs.name].push({
            baselinePath: this.baselinePath,
            message: 'mismatch tolerance not exceeded (~' + misMatchTolerance + '), baseline didn\'t change',
            misMatchPercentage: misMatchTolerance,
            isExactSameImage: misMatchTolerance === 0,
            isSameDimensions: imageDiff.isSameDimensions,
            isWithinMisMatchTolerance: true
        });
    }
};
