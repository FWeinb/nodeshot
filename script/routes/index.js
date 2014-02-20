var  utils         = require('./../lib/utils.js'),
     winston       = require('winston'),
     validator     = require('validator');

module.exports = function (app, config, screenshotApi, cacheService){

  /**
   * Build an options object from the request query.
   */
  var numOptions  = ['width', 'height', 'delay'],
      boolOptions = ['scrollbar', 'force'],
      strOptions  = ['format', 'callback'];

  var buildOptions = function(query, defaults){
    var options = {};

    // Add numOptions
    numOptions.forEach(function(item){
      if (!!query[item]){
        var value = parseInt(query[item], 10);
        // Check if limit are fullfiled
        if ( value <= defaults['max' + item] ){
          options[item] = value;
        }else{
          throw new Error(item + ' must be lesser or equal to ' + defaults['max' + item]);
        }
      }
    });

    // Add strOptions
    strOptions.forEach(function(item){
      if (!!query[item]){
        if (defaults['allowed' + item].indexOf(query[item]) != -1){
          options[item] = query[item];
        } else{
          throw new Error( item + ' must be one of these values: ' + defaults['allowed' + item]);
        }
      }
    });

    // Add boolOptions
    boolOptions.forEach(function(item){
      if (!!query[item]){
        options[item] = false;
        switch(query[item].toLowerCase()){
            case "true":
            case "yes":
            case "1":
              options[item] = true;
          }
      }
    });


    // Merge in defaults
    options.format    = options.format    || defaults.format;
    options.scrollbar = options.scrollbar || defaults.scrollbar;
    options.delay     = options.delay     || defaults.delay;
    options.width     = options.width     || defaults.width;
    options.height    = options.height    || defaults.height;

    return options;
  };


  /**
   * Main route.
   *
   */
  app.get('/', function(req, res, next){

    // Issue a
    if (!req.query.url) {
        res.writeHead(404); res.end('At least the URL query must be set.');
        return;
    }

    var url = req.query.url;

    try{

      if (!validator.isURL(url)){
        throw new Error('Invalid URL: '+ url);
      }


      if ( config.server.cors ){
        res.setHeader('Access-Control-Allow-Origin', '*');
        res.setHeader('Access-Control-Expose-Headers', 'Content-Type');
      }

      // Build options from request.
      var options   = buildOptions(req.query, config.screenshot.url);

      var optionStr = JSON.stringify(options);

      // Create a uniqueID from url, options and the image format
      var image = utils.md5(url + optionStr) + "." + options.format;

      winston.info('Request "%s", cacheId: "%s"', url, image, optionStr);

      // &force will invalidate the cache
      if ( options.force ){
        winston.info('Remove "%s" from cache', image);
        cacheService.removeFile(image);
      }

      // is there a &callback url defined.
      var responseUrl = options.callback;

      // if there is one, answer with 200 OK instantly
      if  (!!responseUrl){
        res.writeHead(200);
        res.end('Response will be send to '+ responseUrl);
      }

      cacheService.getCachedOrCreate(image,
        // How to serve the file
        function( stream ){
          if ( !responseUrl ){ // No response URL. Serve image directly
            winston.info('Serve image directly');
            res.writeHead(200, {'Content-Type' : 'image/'+ options.format });
            stream.pipe(res);
          }else{ // send a post request to the responseUrl
            winston.info('Send image to "%s"', responseUrl);
            stream.pipe(request.post(responseUrl));
          }
        },
        // How to create the screenshot
        function( successCallback ){
          winston.info('New screenshot for "%s"', url);
          winston.profile('Taking screenshot took');
          screenshotApi.screenshot(url, options, function (error, stream){
            if ( error ) {
              res.writeHead(503);
              res.end('' + error);
            } else {
              winston.profile('Taking screenshot took');
              winston.info('Screenshot created for "%s"', url);
              successCallback(stream);
            }
          });
        }
      );
    } catch ( error ){
      winston.info ( '' + error );
      res.writeHead(503);
      res.end('' + error);
    }
  });
};