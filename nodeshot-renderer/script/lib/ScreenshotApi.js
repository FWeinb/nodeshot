var winston       = require('winston');
var stream        = require("stream");
var screenshot    = require('electron-screenshot-service');

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
 *    format: ["png"]
 *    scrollbar: true/false
 *    page: true/false
 *
 *  callback : function ( error, imageBuffer ) { } 
 *
 */
ScreenshotApi.prototype.screenshot = function ( url, options, job, callback ){
  var timeCapture = new Date();
    job.log('Capture');

  if (!options.scrollbar) {
    options.css += '::-webkit-scrollbar{opacity:0 !important;display: none !important;}';
  }

  options.url = url;

  screenshot(
    options
  ).then(function(image){

    var bufferStream = new stream.Transform();
        bufferStream.push(image.data);
        bufferStream.end();

    job.log('Capturing took: %dms',  (new Date() ) - timeCapture );
    job.progress(100, 100);
    callback(null, bufferStream);
  })
  .catch(function(err){
    callback(err, null);
  });

};



module.exports = ScreenshotApi;