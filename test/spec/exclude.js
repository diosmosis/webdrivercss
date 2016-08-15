describe('WebdriverCSS should exclude parts of websites to ignore changing content', function() {
    before(beforeHook);
    after(afterHook);

    before(async function () {
        WebdriverCSS.init(this.browser)

        await this.browser
            .init()
            .windowHandleSize({ width: 800, height: 600 })
    })

    it('should exclude constantly changing content using CSS selectors', async function() {
        await this.browser
            .url(testurlThree)
            .webdrivercss('excludeUsingCssSelectors', {
                elem: '.third',
                exclude: '.third',
                name: '_'
            })

        const compareResult = await compare(
          'webdrivercss/excludeUsingCssSelectors._.baseline.png', 'test/fixtures/excludeElem.png')

        compareResult.isEqual.should.be.equal(true);
        compareResult.equality.should.be.within(0, 0.0001);
    })

    it('should exclude constantly changing content using xPath selectors', async function() {
        await this.browser
            .url(testurlThree)
            .webdrivercss('excludeUsingXPath', {
                elem: '//html/body/section',
                exclude: '//html/body/section',
                name: '_'
            })

        const compareResult = await compare(
            'webdrivercss/excludeUsingXPath._.baseline.png', 'test/fixtures/excludeElem.png')

        compareResult.isEqual.should.be.equal(true);
        compareResult.equality.should.be.within(0, 0.0001);
    })

    it('should exclude constantly changing content using single xy rectangle', async function() {
        await this.browser
            .url(testurlThree)
            .webdrivercss('excludeUsingXYParameters', {
                elem: '.third',
                exclude: {
                    x0: 0,
                    x1: 230,
                    y0: 60,
                    y1: 295
                },
                name: '_'
            })

        const compareResult = await compare(
            'webdrivercss/excludeUsingXYParameters._.baseline.png', 'test/fixtures/excludeElem.png')

        compareResult.isEqual.should.be.equal(true);
        compareResult.equality.should.be.within(0, 0.0001);
    });

    it('should exclude constantly changing content using multiple xy rectangles', async function() {
        await this.browser
            .url(testurlThree)
            .webdrivercss('excludeMultipleXYParameters', {
                elem: '.third',
                exclude: [{
                    x0: 0,
                    x1: 115,
                    y0: 60,
                    y1: 295
                }, {
                    x0: 115,
                    x1: 230,
                    y0: 60,
                    y1: 295
                }],
                name: '_'
            })

        const compareResult = await compare(
            'webdrivercss/excludeMultipleXYParameters._.baseline.png', 'test/fixtures/excludeElem.png')

        compareResult.isEqual.should.be.equal(true);
        compareResult.equality.should.be.within(0, 0.0001);
    });

    it('should exclude constantly changing content using multiple xy points', async function() {
        await this.browser
            .url(testurlThree)
            .webdrivercss('excludeMultipleXYPoints', {
                elem: '.third',
                exclude: [{
                    x0: 0,
                    y0: 60,
                    x1: 100,
                    y1: 60,
                    x2: 100,
                    y2: 260,
                    x3: 0,
                    y3: 260
                }, {
                    x0: 100,
                    y0: 60,
                    x1: 200,
                    y1: 60,
                    x2: 200,
                    y2: 260,
                    x3: 100,
                    y3: 260
                }],
                name: '_'
            })

        const compareResult = await compare(
            'webdrivercss/excludeMultipleXYPoints._.baseline.png', 'test/fixtures/excludeElem.png')

        compareResult.isEqual.should.be.equal(true);
        compareResult.equality.should.be.within(0, 0.0001);
    });
});
