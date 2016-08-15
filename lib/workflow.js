'use strict';

const endSession = require('./endSession.js')

/**
 * run regression test
 */
module.exports = async function(pagename, args) {
    this.needToSync = true;

    /*istanbul ignore next*/
    if (typeof args === 'function') {
        args = {};
    }

    if (!(args instanceof Array)) {
        args = [args];
    }

    /**
     * parameter type check
     */
    /*istanbul ignore next*/
    if (typeof pagename === 'function') {
        throw new Error('A pagename is required');
    }
    /*istanbul ignore next*/
    if (typeof args[0].name !== 'string') {
        throw new Error('You need to specify a name for your visual regression component');
    }

    var queuedShots = JSON.parse(JSON.stringify(args));

    while (queuedShots.length > 0) {
        var currentArgs = queuedShots[0];

        var context = {
            self: this,

            /**
             * default attributes
             */
            misMatchTolerance:      this.options.misMatchTolerance,
            screenshotRoot:         this.options.screenshotRoot,
            failedComparisonsRoot:  this.options.failedComparisonsRoot,

            instance:       this.instance,
            pagename:       pagename,
            applitools:     {
                host: this.options.applitools.host,
                apiKey: this.options.applitools.apiKey,
                appName: pagename,
                baselineName: this.options.applitools.baselineName,
                saveNewTests: this.options.applitools.saveNewTests,
                saveFailedTests: this.options.applitools.saveFailedTests,
                batchId: this.options.applitools.batchId // Group all sessions for this instance together.
            },
            currentArgs:    currentArgs,
            queuedShots:    queuedShots,
            baselinePath:   this.options.screenshotRoot + '/' + pagename + '.' + currentArgs.name + '.baseline.png',
            regressionPath: this.options.screenshotRoot + '/' + pagename + '.' + currentArgs.name + '.regression.png',
            diffPath:       this.options.failedComparisonsRoot + '/' + pagename + '.' + currentArgs.name + '.diff.png',
            screenshot:     this.options.screenshotRoot + '/' + pagename + '.png',
            isComparable:   false,
            saveImages: this.options.saveImages,
            warnings:       [],
            newScreenSize:  0,
            pageInfo:       null,
            updateBaseline: (typeof currentArgs.updateBaseline === 'boolean') ? currentArgs.updateBaseline : this.options.updateBaseline,
            screenWidth:    currentArgs.screenWidth || [].concat(this.options.screenWidth), // create a copy of the origin default screenWidth
        };

        /**
         * initiate result object
         */
        if(!this.options.resultObject[currentArgs.name]) {
            this.options.resultObject[currentArgs.name] = [];
        }

        // start applitools session
        await require('./startSession.js').call(context)

        /**
         * if multiple screen width are given resize browser dimension
         */
        await require('./setScreenWidth.js').call(context)

        /**
         * make screenshot via [GET] /session/:sessionId/screenshot
         */
        await require('./makeScreenshot.js').call(context)

        /**
         * check if files with id already exists
         */
        await require('./renameFiles.js').call(context)

        /**
         * get page informations
         */
        const pageInfo = await require('./getPageInfo.js').call(context)

        /**
         * crop image according to user arguments and its position on screen and save it
         */
        await require('./cropImage.js').call(context, pageInfo)

        /**
         * compare images
         */
        const imageDiff = await require('./compareImages.js').call(context)

        await require('./saveImageDiff.js').call(context, imageDiff)

        // move on to the next screenshot only when the number of screenshot
        // dimensions has been exhausted
        if (!context.screenWidth || !context.screenWidth.length) {
            await endSession.call(context)
            queuedShots.shift();
        }
    }

    this.takeScreenshot = undefined;

    const result = this.options.resultObject;
    this.options.resultObject = {};
    return result
};
