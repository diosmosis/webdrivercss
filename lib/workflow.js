'use strict';

/**
 * run regression test
 */

var async = require('async');

module.exports = function(pagename, args) {

  return new Promise((resolve, reject) => {
    /*!
     * make sure that callback contains chainit callback
     */
    var cb = function (err, res) {
      if (err) {
        reject(err);
      } else {
        resolve(res);
      }
    };

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

    var queuedShots = JSON.parse(JSON.stringify(args)),
        currentArgs = queuedShots[0];

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
        cb:             cb
    };

    /**
     * initiate result object
     */
    if(!this.options.resultObject[currentArgs.name]) {
        this.options.resultObject[currentArgs.name] = [];
    }

    async.waterfall([

        /**
         * initialize session
         */
        require('./startSession.js').bind(context),

        /**
         * if multiple screen width are given resize browser dimension
         */
        require('./setScreenWidth.js').bind(context),

        /**
         * make screenshot via [GET] /session/:sessionId/screenshot
         */
        require('./makeScreenshot.js').bind(context),

        /**
         * check if files with id already exists
         */
        require('./renameFiles.js').bind(context),

        /**
         * get page informations
         */
        require('./getPageInfo.js').bind(context),

        /**
         * crop image according to user arguments and its position on screen and save it
         */
        require('./cropImage.js').bind(context),

        /**
         * compare images
         */
        require('./compareImages.js').bind(context),

        /**
         * save image diff
         */
        require('./saveImageDiff.js').bind(context)
    ],
        /**
         * run workflow again or execute callback function
         */
        require('./asyncCallback.js').bind(context)

    );
  });
};
