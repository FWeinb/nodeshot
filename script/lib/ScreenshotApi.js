var gui           = nwrequire('nw.gui'), // Require NW module
    winston       = require('winston'),
    base64decode  = require('base64-stream').decode,
    fs            = require('fs');

// Reference of the MainWindow
var mainWindow  = gui.Window.get();


var ScreenshotApi = function (config) {
  this.config = config;
};

/*
 * Take the screen capture
 */
var capture = function (nwwindow, options, callback){
   // Capture!
   nwwindow.capturePage(function(img) {
     var stream = base64decode();
         stream.write(img.replace(/^data:image\/(png|jpg|jpeg);base64,/, ""));
         stream.end();

     // Close the Window
     nwwindow.close(true);

     // Execute callback
     callback(null, stream);
  }, options.format);
};

/**
 * Inject css and execute delay
 */
var screenshot = function(nwwindow, window, options, config, callback ){
  // Remove scrollbar
  if ( !options.scrollbar ){
    var style = window.document.createElement('style');
        style.innerHTML = 'html,body { overflow: hidden; }';
    window.document.body.appendChild(style);
  }

  // Wait for options.delay
  setTimeout(function(){
    if ( options.fullpage ) {

      nwwindow.on('resize', function(width, height){
        winston.info('Resized: %dx%d', width, height);
        setTimeout(function(){
          capture ( nwwindow, options, callback );
        }, 500); // Better save than sorry
      });

      var rect = window.document.body.getBoundingClientRect();
      nwwindow.resizeTo(Math.round(rect.width), Math.round(rect.height) + 100);

    } else {

      capture ( nwwindow, options, callback );

    }

  }, options.delay );
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
 *    fullpage: true/false
 *
 *  callback : function ( error, stream ) { } 
 *
 */
ScreenshotApi.prototype.screenshot = function ( url, options, callback ){

  options.show = this.config.headless; // Hide the window if we aren't running in headless mode.
  options.nodejs = false;              // Disable nodejs for the new window.

  var popWindow,
      frameTimeout,
      timeoutTimer = setTimeout(function(){
        if (!!popWindow) popWindow.close(true);
        callback(new Error('Requesting ' + url + ' took longer than '+ this.config.timeout + 'ms'), null);
      }.bind(this), this.config.timeout);

    popWindow = gui.Window.open(url, options);

    // node-webkit is firing the `document-end` event for each iframe.
    popWindow.on('document-end', function(frame){
        clearTimeout(timeoutTimer);

        // Clear the timer of the previous frame
        clearTimeout(frameTimeout);

        // Restart the frameTimeout again fort his frame.
        frameTimeout = setTimeout(function(){
          // Take a screenshot if no iFrames are loaded for more than this.config.iframetimeout
          screenshot(popWindow, popWindow.window, options, this.config, callback);
        }.bind(this), this.config.iframetimeout);
    }.bind(this));

};


module.exports = ScreenshotApi;