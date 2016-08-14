'use strict';

const promisify = require('es6-promisify')
const glob = promisify(require('glob'))
const fs = require('fs')

const rename = promisify(fs.rename)

module.exports = async function() {
    const files = await glob('{' + this.regressionPath + ',' + this.baselinePath + '}', {})

    /**
     * if no files were found continue
     */
    if(files.length === 0) {
        return;
    }

    this.isComparable = true;
    this.filename = this.regressionPath;

    /**
     * rename existing files
     */
    if (files.length === 2 && this.updateBaseline && !this.self.options.usesApplitools) {
        await rename(this.regressionPath, this.baselinePath);
    }
};
