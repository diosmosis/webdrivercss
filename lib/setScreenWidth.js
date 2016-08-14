'use strict';

/**
 * if multiple screen width are given resize browser dimension
 */

var takenScreenSizes = {};

module.exports = async function() {
    this.newScreenSize = {};

    /**
     * get current browser resolution to change back to it
     * after all shots were taken (only if a screenWidth is set)
     */
     if (!this.self.defaultScreenDimension && this.screenWidth && this.screenWidth.length) {
         var res = await this.instance.windowHandleSize()
         this.self.defaultScreenDimension = res.value
     }

     // if no screenWidth option was set just continue
     if(!this.screenWidth || this.screenWidth.length === 0) {
         return;
     }

     this.newScreenSize.width = parseInt(this.screenWidth.shift(), 10);
     this.newScreenSize.height = parseInt(this.self.defaultScreenDimension.height, 10);

     this.self.takeScreenshot = false;
     if(!takenScreenSizes[this.pagename] || takenScreenSizes[this.pagename].indexOf(this.newScreenSize.width) < 0) {
         /**
          * set flag to retake screenshot
          */
         this.self.takeScreenshot = true;

         /**
          * cache already taken screenshot / screenWidth combinations
          */
         if(!takenScreenSizes[this.pagename]) {
             takenScreenSizes[this.pagename] = [this.newScreenSize.width];
         } else {
             takenScreenSizes[this.pagename].push(this.newScreenSize.width);
         }
     }

     /**
      * resize browser resolution
      */
     /**
      * if shot will be taken in a specific screenWidth, rename file and append screen width
      * value in filename
      */
     this.baselinePath   = this.baselinePath.replace(/\.(baseline|regression|diff)\.png/,'.' + this.newScreenSize.width + 'px.$1.png');
     this.regressionPath = this.regressionPath.replace(/\.(baseline|regression|diff)\.png/,'.' + this.newScreenSize.width + 'px.$1.png');
     this.diffPath       = this.diffPath.replace(/\.(baseline|regression|diff)\.png/,  '.' + this.newScreenSize.width + 'px.$1.png');
     this.screenshot     = this.screenshot.replace(/\.png/, '.' + this.newScreenSize.width + 'px.png');
     this.filename       = this.baselinePath;

     await this.instance.setViewportSize({width: this.newScreenSize.width, height: this.newScreenSize.height});
     await this.instance.pause(100);
};
