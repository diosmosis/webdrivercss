describe('WebdriverCSS compares images and exposes information about CSS regression', function() {
    before(beforeHook);
    after(afterHook);

    var capturingData = {
        elem: '.yellow',
        name: 'test-component',
        width: 550,
        height: 102
    };

    before(async function () {
        WebdriverCSS.init(this.browser)

        await this.browser
            .init()
            .url(testurl)
            .windowHandleSize({ width: 800, height: 600 })
    })

    describe('should take a screenshot of same area without any changes in it', function(done) {
        var resultObject;

        before(async function() {
            const res = await this.browser.webdrivercss('comparisonTest', capturingData);
            resultObject = res[capturingData.name][0];
        });

        it('should exist an image (*.baseline.png) in the default image folder', function(done) {
            fs.exists(resultObject.baselinePath, function(exists) {
                exists.should.equal(true);
                done();
            });
        });

        it('should NOT exist an image (*.regression.png) in the default image folder', function(done) {
            fs.exists('webdrivercss/comparisonTest.test-component.regression.png', function(exists) {
                exists.should.equal(false);
                done();
            });
        });

        it('should NOT exist an image (*.diff.png) in the default failed comparisons image folder', function(done) {
            fs.exists('webdrivercss/diff/comparisonTest.test-component.diff.png', function(exists) {
                exists.should.equal(false);
                done();
            });
        });

        it('should return a proper result object', function() {
            resultObject.misMatchPercentage.should.equal(0);
            resultObject.isExactSameImage.should.equal(true);
            resultObject.isSameDimensions.should.equal(true);
            resultObject.isWithinMisMatchTolerance.should.equal(true);
        });

    });

    describe('should change something within given area to do an image diff', function() {
        var resultObject = {};

        before(async function() {
            const res = await this.browser
                .execute(function() {
                    document.querySelector('.green').style.backgroundColor = 'white';
                    document.querySelector('.black').style.backgroundColor = 'white';
                },[])
                .webdrivercss('comparisonTest', capturingData);

            resultObject = res[capturingData.name][0];
        });

        it('should exist an image (*.baseline.png) in the default image folder', function(done) {
            fs.exists(resultObject.baselinePath, function(exists) {
                exists.should.equal(true);
                done();
            });
        });

        it('should exist an image (*.regression.png) in the default image folder', function(done) {
            fs.exists(resultObject.regressionPath, function(exists) {
                exists.should.equal(true);
                done();
            });
        });

        it('should exist an image (*.diff.png) in the default failed comparisons image folder', function(done) {
            fs.exists(resultObject.diffPath, function(exists) {
                exists.should.equal(true);
                done();
            });
        });

        it('should exist an *.diff image with same dimension', function() {
            resultObject.isSameDimensions.should.be.a('boolean');
            resultObject.isSameDimensions.should.equal(true);
        });

        it('should have an mismatch percentage of 35.65%', function() {
            resultObject.misMatchPercentage.should.be.a('number');
            resultObject.misMatchPercentage.should.equal(35.65);
            resultObject.isExactSameImage.should.equal(false);
            resultObject.isWithinMisMatchTolerance.should.equal(false);
        });

    });

    describe('should take a screenshot of same area without any changes in it', function() {
        var resultObject = {};

        before(async function() {
            const res = await this.browser.webdrivercss('comparisonTest', capturingData);
            resultObject = res[capturingData.name][0];
        });

        it('should exist an image (*.baseline.png) in the default image folder', function(done) {
            fs.exists(resultObject.baselinePath, function(exists) {
                exists.should.equal(true);
                done();
            });
        });

        it('should exist an image (*.regression.png) in the default image folder', function(done) {
            fs.exists(resultObject.regressionPath, function(exists) {
                exists.should.equal(true);
                done();
            });
        });

        it('should exist an image (*.diff.png) in the default failed comparisons image folder', function(done) {
            fs.exists(resultObject.diffPath, function(exists) {
                exists.should.equal(true);
                done();
            });
        });

        it('should exist an *.diff image with same dimension', function() {
            resultObject.isSameDimensions.should.be.a('boolean');
            resultObject.isSameDimensions.should.equal(true);
        });

        it('should have an mismatch percentage of 35.65%', function() {
            resultObject.misMatchPercentage.should.be.a('number');
            resultObject.misMatchPercentage.should.equal(35.65);
            resultObject.isExactSameImage.should.equal(false);
            resultObject.isWithinMisMatchTolerance.should.equal(false);
        });

    });

    describe('updates baseline if updateBaseImages is given', function(done) {
        var resultObject = {};

        before(async function() {
            capturingData.updateBaseline = true;

            const res = await this.browser.webdrivercss('comparisonTest', capturingData);
            resultObject = res[capturingData.name][0];
        });

        it('should exist an image (*.baseline.png) in the default image folder', function(done) {
            fs.exists(resultObject.baselinePath, function(exists) {
                exists.should.equal(true);
                done();
            });
        });

        it('should NOT exist an image (*.regression.png) in the default image folder', function(done) {
            fs.exists('webdrivercss/comparisonTest.test-component.regression.png', function(exists) {
                exists.should.equal(false);
                done();
            });
        });

        it('should NOT exist an image (*.diff.png) in the default failed comparisons image folder', function(done) {
            fs.exists('webdrivercss/diff/comparisonTest.test-component.diff.png', function(exists) {
                exists.should.equal(false);
                done();
            });
        });

        it('should return a proper result object', function() {
            resultObject.misMatchPercentage.should.equal(0);
            resultObject.isExactSameImage.should.equal(true);
            resultObject.isSameDimensions.should.equal(true);
            resultObject.isWithinMisMatchTolerance.should.equal(true);
        });

    });

    describe('should match an image when match percentage is equal to tolerance', function() {
        var resultObject = {};

        before(async function() {
            const res = await this.browser
                .url(testurlFour)
                .webdrivercss('comparisonTest', {
                    elem: '#container',
                    name: 'test-equal'
                })
                .execute(function() {
                    document.querySelector('#difference').style.backgroundColor = 'white';
                }, [])
                .webdrivercss('comparisonTest', {
                    elem: '#container',
                    name: 'test-equal'
                });
            resultObject = res['test-equal'][0];
        });

        it('should be within tolerance', function() {
            resultObject.misMatchPercentage.should.be.a('number');
            resultObject.misMatchPercentage.should.equal(0.05);
            resultObject.isExactSameImage.should.equal(false);
            resultObject.isWithinMisMatchTolerance.should.equal(true);
        });

    });
});
