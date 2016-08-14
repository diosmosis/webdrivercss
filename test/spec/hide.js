describe('WebdriverCSS should hide parts of websites to ignore changing content', function() {
    before(beforeHook);
    after(afterHook);

    before(async function () {
        WebdriverCSS.init(this.browser, { saveImages: true })

        await this.browser
            .init()
            .windowHandleSize({ width: 800, height: 600 })
    })

    it('should hide constantly changing content using CSS selectors', async function() {
        await this.browser
            .url(testurlThree)
            .webdrivercss('hideUsingCssSelectors', {
                elem: '.third',
                hide: '.third',
                name: '_'
            })

        const compareResult = await compare(
            'webdrivercss/hideUsingCssSelectors._.baseline.png', 'test/fixtures/hideElem.png')

        compareResult.isEqual.should.be.equal(true);
        compareResult.equality.should.be.within(0, 0.0001);
    });

    it('should exclude constantly changing content using xPath selectors', async function() {
        await this.browser
            .url(testurlThree)
            .webdrivercss('hideUsingXPath', {
                elem: '//html/body/section',
                hide: '//html/body/section',
                name: '_'
            })

        const compareResult = await compare(
            'webdrivercss/hideUsingXPath._.baseline.png', 'test/fixtures/hideElem.png')

        compareResult.isEqual.should.be.equal(true);
        compareResult.equality.should.be.within(0, 0.0001);
    });
});
