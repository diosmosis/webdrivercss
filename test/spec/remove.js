describe('WebdriverCSS should remove parts of websites to ignore changing content', function() {
    before(beforeHook);
    after(afterHook);

    before(async function () {
        WebdriverCSS.init(this.browser, { saveImages: true })

        await this.browser
            .init()
            .windowHandleSize({ width: 800, height: 600 })
    })

    it('should remove constantly changing content using CSS selectors', async function() {
        await this.browser
            .url(testurlThree)
            .webdrivercss('removeUsingCssSelectors', {
                elem: '#third',
                remove: '.third',
                name: '_'
            })

        const compareResult = await compare(
          'webdrivercss/removeUsingCssSelectors._.baseline.png', 'test/fixtures/hideElem.png')

        compareResult.isEqual.should.be.equal(true);
        compareResult.equality.should.be.within(0, 0.0001);
    });

    it('should exclude constantly changing content using xPath selectors', async function() {
        await this.browser
            .url(testurlThree)
            .webdrivercss('removeUsingXPath', {
                elem: '//html/body/section',
                remove: '//html/body/section/div',
                name: '_'
            })

        const compareResult = await compare(
          'webdrivercss/removeUsingXPath._.baseline.png', 'test/fixtures/hideElem.png')

        compareResult.isEqual.should.be.equal(true);
        compareResult.equality.should.be.within(0, 0.0001);
    });
});
