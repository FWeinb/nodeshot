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
 *    scrollbar: true/false
 *
 *  callback : function ( error, stream ) { } 
 *
 */
ScreenshotApi.prototype.screenshot = function ( url, options, callback ){

  // Track if the request was canceled
  var canceled = false;

  // Starte the timeoutTimer
  var timeoutTimer = setTimeout(function(){
    canceled = true;
    callback(new Error('Requesting ' + url + ' took longer than '+ options.timeout + 'ms'), null);
  }, this.config.timeout);

  // Hide window in non headless mode
  options.show = this.config.headless; // Hide the window if we aren't running in headless mode.
  options.nodejs = false;              // Disable nodejs for the new window.
  options['new-instance'] = false;

  var popWindow = gui.Window.open(url, options);

    /**
     *  Main screenshot function.
     *  Triggerd when either all iframes are loaded or one or more iframes need more than config.iframetimeout to load
     */
    var screenshot = function(){
      // Break here if request was canceled
      if ( canceled ) {
        popWindow.close(true);
        return;
      }
      // Remove scrollbar
      if ( !options.scrollbar ){
        var style = popWindow.window.document.createElement('style');
        style.innerHTML = 'html,body { overflow: hidden; }';
        popWindow.window.document.body.appendChild(style);
      }

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

    };

    var iFramesLoaded = 0,
        frameTimeout;

    // node-webkit is firing the loaded event for each iframe.
    // so let's count the invocations of loaded and only take the screenshot if all iframes are loaded.
    // !THIS IS HACKY!
    popWindow.on('loaded', function() {
      iFramesLoaded++;

      // Cancel the timeoutTimer
      clearTimeout(timeoutTimer);

      // Reset the last frameTimeout
      clearTimeout(frameTimeout);

      // Start a new iFrame timout.
      frameTimeout = setTimeout(function(){
        screenshot();
      }, this.config.iframetimeout);

      // Only run this if iFramesLoaded equals the amount of iframes on the page.
      if ( iFramesLoaded === popWindow.window.frames.length  + 1 ) {
        clearTimeout(frameTimeout);
        screenshot();
      }

    }.bind(this));
};


module.exports = ScreenshotApi;