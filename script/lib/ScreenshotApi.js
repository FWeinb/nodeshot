var gui           = nwrequire('nw.gui'), // Require NW module
    base64decode  = require('base64-stream').decode,
    fs            = require('fs');

// Reference of the MainWindow
var mainWindow  = gui.Window.get();


var ScreenshotApi = function () { };

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
  var canceled = false;
  var timoutTimer = setTimeout(function(){
    canceled = true;
    callback(new Error("Requesting " + url + " took longer than "+ options.timeout + "ms"), null);
  }, options.timeout);

  // Hide window
  // TODO: This will fail in headless mode!!
  options.show = false;

  var popWindow = gui.Window.open(url, options);

    popWindow.on('loaded', function() {

      // Break here if request was canceled
      if ( canceled ) return;

      // Cancel the timoutTimer
      clearTimeout(timoutTimer);

      // Wait for options.delay
      setTimeout(function(){
        // Capture!
        popWindow.capturePage(function(img) {
          var stream = base64decode();
              stream.write(img.replace(/^data:image\/(png|jpg|jpeg);base64,/, ""));
              stream.end();
          popWindow.close();

          // Execute callback
            callback(null, stream);

        }, options.format);
      }, options.delay );
    });
};


module.exports = ScreenshotApi;