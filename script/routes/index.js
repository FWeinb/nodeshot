var  utils         = require('./../lib/utils.js'),
     validator     = require('validator');

module.exports = function (app, config, screenshotApi, cacheService){

  /**
   * Build a options object from the request query.
   */
  var numOptions = ['width', 'height', 'delay'],
      strOptions = ['format'];

  var buildOptions = function(query){
    var options = {};

    // Add numOptions
    numOptions.forEach(function(item){
      if (!!query[item]){
        var value = parseInt(query[item], 10);
        // Check if limit are fullfiled
        if ( value <= config.screenshot["max"+item] ){
          options[item] = value;
        }else{
          throw new Error(item + " must be lesser or equal to " + config.screenshot["max"+item]);
        }
      }
    });
    // Add strOptions
    strOptions.forEach(function(item){
      if (!!query[item]){
        options[item] = query[item];
      }
    });

    // Merge in defaults
    options.format = options.format || config.screenshot.format;
    options.delay  = options.delay  || config.screenshot.delay;
    options.width  = options.width  || config.screenshot.width;
    options.height = options.height || config.screenshot.height;
    options.timeout= options.timeout|| config.screenshot.timeout;

    return options;
  };


  /**
   * Main route.
   *
   */
  app.get('/', function(req, res, next){

    // Issue a
    if (!req.query.url) {
        res.writeHead(404); res.end("At least the URL query must be set.");
        return;
    }

    var url = req.query.url;


    try{

      if (!validator.isURL(url)){
        throw new Error('Invalid URL: '+ url);
      }


      // Build options from request.
      var options   = buildOptions(req.query);

      var optionStr = JSON.stringify(options);

      // Create a uniqueID from url, options and the image format
      var image = utils.md5(url + optionStr) + "." + options.format;

      console.log("Request: " + url + " => cache: " + image + " with " + optionStr);

      // &force will invalidate the cache
      if ( !!req.query.force ){
        console.log("Remove from " + image + " Cache!");
        cacheService.removeFile(image);
      }

      // is there a &callback url defined.
      var responseUrl = req.query.callback;
      if ( !!responseUrl ){
        res.writeHead(200);
        res.end("Response will be send to "+ responseUrl);
      }

      cacheService.getCachedOrCreate(image,
        // How to serve the file
        function( stream ){
              if ( !responseUrl ){ // No response URL. Response with image

                if ( config.server.cors ){
                    res.setHeader("Access-Control-Allow-Origin", "*");
                    res.setHeader("Access-Control-Expose-Headers", "Content-Type");
                }
                res.writeHead(200, {"Content-Type" : "image/"+ options.format });
                stream.pipe(res);

              }else{ // send a post request to the responseUrl
                console.log("Send Screenshot to " + responseUrl);
                stream.pipe(request.post(responseUrl));
              }
        },
        // How to create the screenshot
        function( successCallback ){
          console.log("Take new screenshot");
          screenshotApi.screenshot(url, options, function (error, stream){
            if ( error ) {
              res.writeHead(503);
              res.end('' + error);
            } else {
              successCallback(stream);
            }
          });
        }
      );
    } catch ( error ){
      res.writeHead(503);
      res.end('' + error);
    }
  });
};