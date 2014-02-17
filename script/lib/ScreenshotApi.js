var gui           = nwrequire('nw.gui'), // Require NW module
    base64decode  = require('base64-stream').decode,
    fs            = require('fs');

// Reference of the MainWindow
var mainWindow  = gui.Window.get();


var ScreenshotApi = function (config) {
  this.config = config;
};

/**
 * This function will make a screenshot.
 *  url : URL to screenshot
 *  options :
 *    width:  viewport-width
 *    height: viewport-height
 *    delay:  delay in ms
 *    format: ["png", "jpeg"]
 *    timeout: how long to wait till the page is fully loaded
 *
 *  callback : function ( error, stream ) { } 
 *
 */
ScreenshotApi.prototype.screenshot = function ( url, options, callback ){

  // Track if the request was canceled
  var canceled = false;

  // Starte the timeoutTimer
  var timoutTimer = setTimeout(function(){
    canceled = true;
    callback(new Error("Requesting " + url + " took longer than "+ options.timeout + "ms"), null);
  }, options.timeout + options.delay);

  // Hide window in non headless mode
  options.show = this.config.headless; // Hide the window if we aren't running in headless mode.
  options.nodejs = false;              // Disable nodejs for the new window.

  var popWindow = gui.Window.open(url, options);

    var iFramesLoaded = 0;

    // node-webkit is fireing the loaded event for each iframe.
    // so let's count the invocations of loaded and only take the screenshot if all iframes are loaded.
    // !THIS IS HACKY!
    popWindow.on('loaded', function() {
      iFramesLoaded++;

      // Break here if request was canceled
      if ( canceled ) {
        popWindow.close(true);
        return;
      }

      // Only run this if iFramesLoaded equals the amount of iframes on the page.
      if ( iFramesLoaded === popWindow.window.frames.length  + 1 ) {
        // Cancel the timoutTimer
        clearTimeout(timoutTimer);

        // Wait for options.delay
        setTimeout(function(){
          // Capture!
          popWindow.capturePage(function(img) {
            var stream = base64decode();
                stream.write(img.replace(/^data:image\/(png|jpg|jpeg);base64,/, ""));
                stream.end();
            // Close the Window
            popWindow.close(true);

            // Execute callback
            callback(null, stream);

          }, options.format);
        }, options.delay );
      }
    });
};


module.exports = ScreenshotApi;