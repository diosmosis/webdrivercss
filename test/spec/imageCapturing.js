describe('WebdriverCSS captures desired parts of a website as screenshot with specific dimension', function() {
    before(beforeHook);
    after(afterHook);

    before(async function () {
        WebdriverCSS.init(this.browser, { saveImages: true })

        await this.browser
            .init()
            .windowHandleSize({ width: 800, height: 600 })
    })

    describe('should do a screenshot of a whole website if nothing specified', function() {
        var documentHeight = 0;

        before(async function() {
            const res = await this.browser
                .url(testurl)
                .webdrivercss('testWithoutParameter', { name: 'withoutParams'})
                .execute(function(){
                    return document.body.clientHeight;
                });

            documentHeight = res.value;
        });

        it('should exist an image in the default image folder', async function() {
            const stat = fs.statSync('webdrivercss/testWithoutParameter.withoutParams.baseline.png')
            stat.isFile().should.be.true;
        });

        it('should have the size of browser dimension', function(done) {
            gm('webdrivercss/testWithoutParameter.withoutParams.baseline.png').size(function(err,size) {
                if (err) {
                  return done(err);
                }

                size.width.should.be.equal(800);
                // It's not clear why image height is slightly different from document height in
                // some environments. See issue #76.
                size.height.should.be.within(documentHeight - 20, documentHeight + 20);
                done();
            });
        });

        it('should equal to fixture image', async function() {
          const compareResult = await compare(
              'webdrivercss/testWithoutParameter.withoutParams.baseline.png', 'test/fixtures/testWithoutParameter.current.png')

          compareResult.isEqual.should.be.equal(true);
          compareResult.equality.should.be.within(0, 0.005);
        });
    });

    describe('should do a screenshot with specific width and height values', function() {

        before(async function() {
            await this.browser
                .url(testurl)
                .webdrivercss('testWithWidthHeightParameter', {
                    name: '_',
                    x: 100,
                    y: 100,
                    width: 100,
                    height: 100
                });
        });

        it('should exist an image in the default image folder', function() {
            const stat = fs.statSync('webdrivercss/testWithWidthHeightParameter._.baseline.png');
            stat.isFile().should.be.true;
        });

        it('should have same size like given parameter', function(done) {
            gm('webdrivercss/testWithWidthHeightParameter._.baseline.png').size(function(err,size) {
                if (err) {
                  return done(err);
                }

                size.width.should.be.equal(100);
                size.height.should.be.equal(100);
                done();
            });
        });

        it('should equal to fixture image', async function() {
            const compareResult = await compare(
                'webdrivercss/testWithWidthHeightParameter._.baseline.png', 'test/fixtures/testWithWidthHeightParameter.current.png')

            compareResult.isEqual.should.be.equal(true);
            compareResult.equality.should.be.within(0, 0.005);
        });
    });

    describe('should do a screenshot of a given element', function() {
        before(async function() {
            await this.browser
                .url(testurl)
                .webdrivercss('testWithGivenElement', {
                    elem: '.red',
                    name: '_'
                });
        });

        it('should exist an image in the default image folder', function() {
            const stat = fs.statSync('webdrivercss/testWithGivenElement._.baseline.png');
            stat.isFile().should.be.true;
        });

        it('should have the size of given element', function(done) {
            gm('webdrivercss/testWithGivenElement._.baseline.png').size(function(err,size) {
                if (err) {
                  return done(err);
                }

                size.width.should.be.equal(102);
                size.height.should.be.equal(102);
                done();
            });
        });

        it('should equal to fixture image', async function() {
            const compareResult = await compare(
                'webdrivercss/testWithGivenElement._.baseline.png', 'test/fixtures/testWithGivenElement.current.png')

            compareResult.isEqual.should.be.equal(true);
            compareResult.equality.should.be.within(0, 0.005);
        });
    });

    describe('should do a screenshot of multiple elements', function() {
        var optsArrayOrig = [
            {
                elem: '.red',
                name: 'red'
            }, {
                elem: '.green',
                name: 'green'
            }];
        var optsArrayClone = JSON.parse(JSON.stringify(optsArrayOrig));

        before(async function() {
            await this.browser
                .url(testurl)
                .webdrivercss('testWithMultipleElement', optsArrayClone);
        });

        it('should exist two images in the default image folder', function() {
            fs.statSync('webdrivercss/testWithMultipleElement.png').isFile().should.equal(true);
            fs.statSync('webdrivercss/testWithMultipleElement.red.baseline.png').isFile().should.equal(true);
            fs.statSync('webdrivercss/testWithMultipleElement.green.baseline.png').isFile().should.equal(true);
        });

        it('should not change the array passed in', function() {
            optsArrayClone.should.deep.equal(optsArrayOrig);
        });
    });

    describe('should do a screenshot of a given element with given width/height', function() {
        var documentHeight = 0;

        before(async function() {
            await this.browser
                .url(testurl)
                .webdrivercss('testWithGivenElementAndWidthHeight', {
                    elem: '.yellow',
                    name: '_',
                    width: 550,
                    height: 102
                });
        });

        it('should exist an image in the default image folder', function() {
            fs.statSync('webdrivercss/testWithGivenElementAndWidthHeight._.baseline.png').isFile()
                .should.equal(true);
        });

        it('should have the size of given element', function(done) {
            gm('webdrivercss/testWithGivenElementAndWidthHeight._.baseline.png').size(function(err,size) {
                if (err) {
                  return done(err);
                }

                size.width.should.be.equal(550);
                size.height.should.be.equal(102);
                done();
            });
        });

        it('should equal to fixture image', async function() {
            const compareResult = await compare(
                'webdrivercss/testWithGivenElementAndWidthHeight._.baseline.png',
                'test/fixtures/testWithGivenElementAndWidthHeight.current.png')

            compareResult.isEqual.should.be.equal(true);
            compareResult.equality.should.be.within(0, 0.005);
        });
    });

    describe('should do a screenshot at specific x,y position with specific width,height', function() {

        var documentHeight = 0;

        before(async function() {
            await this.browser
                .url(testurl)
                .webdrivercss('testAtSpecificPosition', {
                    x: 15,
                    y: 15,
                    width: 230,
                    height: 50,
                    name: '_'
                });
        });

        it('should exist an image in the default image folder', function() {
            fs.statSync('webdrivercss/testAtSpecificPosition._.baseline.png').isFile()
                .should.equal(true);
        });

        it('should have same size like given parameter', function(done) {
            gm('webdrivercss/testAtSpecificPosition._.baseline.png').size(function(err,size) {
                if (err) {
                    return done(err);
                }

                size.width.should.be.equal(230);
                size.height.should.be.equal(50);
                done();
            });
        });

        it('should equal to fixture image', async function() {
            const compareResult = await compare(
                'webdrivercss/testAtSpecificPosition._.baseline.png',
                'test/fixtures/testAtSpecificPosition.current.png')

            compareResult.isEqual.should.be.equal(true);
            compareResult.equality.should.be.within(0, 0.005);
        });

    });

    describe('should capture areas which are not within viewport', function() {
        it('using elem option', async function() {
            await this.browser
                .url(testurlTwo)
                .webdrivercss('notWithinViewportElem', {
                    elem: '.iamdownhere',
                    name: '_'
                })

            const compareResult = await compare(
                'webdrivercss/notWithinViewportElem._.baseline.png', 'test/fixtures/notWithinViewport.png')

            compareResult.isEqual.should.be.equal(true);
            compareResult.equality.should.be.within(0, 0.005);
        });

        it('using xy coordinates', async function() {
            await this.browser
                .url(testurlTwo)
                .webdrivercss('notWithinViewportXY', {
                    x: 3000,
                    y: 3295,
                    width: 80,
                    height: 40,
                    name: '_'
                })

            const compareResult = await compare(
                'webdrivercss/notWithinViewportXY._.baseline.png', 'test/fixtures/notWithinViewport.png')

            compareResult.isEqual.should.be.equal(true);
            compareResult.equality.should.be.within(0, 0.005);
        });
    });
});
