var gui           = nwrequire('nw.gui'), // Require NW module
    winston       = require('winston'),
    stream        = require("stream"),
    fs            = require('fs');

// Reference of the MainWindow
var mainWindow  = gui.Window.get();


var ScreenshotApi = function (config) {
  this.config = config;
};

/*
 * Take the screen capture
 */
var capture = function (nwwindow, options, job, callback){

  job.log('Capture');
   // Capture!
   var timeCapture = new Date();
   nwwindow.capturePage(function(img) {
    job.log('Capturing took: %dms',  (new Date() ) - timeCapture );
    var bufferStream = new stream.Transform();
        bufferStream.push(new Buffer(img.replace(/^data:image\/(png|jpg|jpeg);base64,/, ""), "base64"));
        bufferStream.end();

     job.log('Close Window');
     job.progress(100, 100);
     // Close the Window
     nwwindow.close(true);

     // Execute callback
     callback(null, bufferStream);
  }, options.format);
};

/**
 * Inject css and execute delay
 */
var screenshot = function(nwwindow, window, options, job, config, callback ){


  // Remove scrollbar
  if ( !options.scrollbar ){
    job.log("Remove scrollbar");
    job.progress(50, 100);
    try {

    var style = window.document.createElement('style');
        style.innerHTML = 'html,body { overflow: hidden; }';
    window.document.body.appendChild(style);

    } catch ( e ) {
      callback( e, null);
    }
  }


  job.progress(60, 100);
  // Wait for options.delay
  setTimeout(function(){
    job.progress(70, 100);

    if ( options.fullpage ) {

      try{

        nwwindow.on('resize', function(width, height){
          // Limit the height to maxheight
          if ( config.maxheight > 0 ) {
            height = Math.min(height, config.maxheight);
          }

          job.log("Resized: %dx%d", width, height);
          job.progress(90, 100);

          winston.info('Resized: %dx%d', width, height);
          setTimeout(function(){
            capture ( nwwindow, options, job, callback );
          }, 500); // Better save than sorry
        });

        var rect = window.document.body.getBoundingClientRect();
        nwwindow.resizeTo(Math.round(rect.width), Math.round(rect.height) + 100);
        job.progress(80, 100);

      } catch( e ) {
        callback( e, null);
      }
    } else {

      job.progress(90, 100);
      capture ( nwwindow, options, job, callback );

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
ScreenshotApi.prototype.screenshot = function ( url, options, job, callback ){

  if ( this.config.maxheight > 0 ) {
    options.height = Math.min(options.height, this.config.maxheight);
  }

  options.show = this.config.showwindow; // Hide the window if we aren't running in headless mode.
  options.nodejs = false;                // Disable nodejs for the new window.

  var popWindow,
      frameTimeout,
      timeoutTimer = setTimeout(function(){
        if (!!popWindow) popWindow.close(true);
        callback(new Error('Requesting ' + url + ' took longer than '+ this.config.timeout + 'ms'), null);
      }.bind(this), this.config.timeout);

    popWindow = gui.Window.open(url, options);
    job.log("Open %s", url);
    job.progress(20, 100);
    // node-webkit is firing the `document-end` event for each iframe.
    popWindow.on('document-end', function(frame){
        job.log("Frame Loaded");

        clearTimeout(timeoutTimer);

        // Clear the timer of the previous frame
        clearTimeout(frameTimeout);

        // Restart the frameTimeout again fort his frame.
        frameTimeout = setTimeout(function(){
          try{

            job.log("All frames loaded");
            job.progress(40, 100);

            // If popWindow.window.location.host is empty page not found
            if (popWindow.window.location.host === ''){
              popWindow.close(true);
              callback(new Error('Page "' + url + '" not found.'), null);
              return;
            }

            // Take a screenshot if no iFrames are loaded for more than this.config.iframetimeout
            screenshot(popWindow, popWindow.window, options, job, this.config, callback);
          } catch ( e ) {
            // Handle any error.
            callback( e, null );
          }
        }.bind(this), this.config.iframetimeout);
    }.bind(this));

};



module.exports = ScreenshotApi;