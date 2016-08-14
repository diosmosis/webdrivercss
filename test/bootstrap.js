const exec = require('child-process-promise').exec;

/**
 * require dependencies
 */
global.WebdriverIO  = require('webdriverio');
global.WebdriverCSS = require('../index.js');
global.fs = require('fs-extra');
global.gm = require('gm');
global.glob = require('glob');
global.async  = require('async');
global.should = require('chai').should();
global.expect = require('chai').expect;
global.capabilities = {logLevel: 'silent',desiredCapabilities:{browserName: 'phantomjs'}};
global.testurl = 'http://localhost:8080/test/site/index.html';
global.testurlTwo = 'http://localhost:8080/test/site/two.html';
global.testurlThree = 'http://localhost:8080/test/site/three.html';
global.testurlFour = 'http://localhost:8080/test/site/four.html';

/**
 * set some fix test variables
 */
global.screenshotRootDefault = 'webdrivercss';
global.failedComparisonsRootDefault = 'webdrivercss/diff';
global.screenshotRootCustom = '__screenshotRoot__';
global.failedComparisonsRootCustom = '__failedComparisonsRoot__';

require('./site');

global.compare = function compare(...files) {
  return new Promise((resolve, reject) => {
    gm.compare(...files, (err, isEqual, equality, raw) => {
      if (err) {
        return reject(err)
      }

      resolve({
        isEqual,
        equality,
        raw,
      })
    })
  })
}

global.beforeHook = async function () {
    fs.removeSync(screenshotRootDefault)
    fs.removeSync(screenshotRootCustom)

    this.browser = WebdriverIO.remote(capabilities)
};

global.afterHook = function(done) {
    var browser = this.browser;

    /**
     * close browser and clean up created directories
     */
    async.parallel([
        function(done) {
            browser.end()
                .then(done.bind(null, null))
                .catch(done);
        },
        function(done) { fs.remove(failedComparisonsRootDefault,done); },
        function(done) { fs.remove(failedComparisonsRootCustom,done); },
        function(done) {
          exec('rm -r .tmp*').then(function (res) {
            setImmediate(done);
          }, function (err) {
            setImmediate(done);
          })
        },
    ], done);

};
