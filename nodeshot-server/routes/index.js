var  utils         = require('./../lib/utils.js'),
     fs            = require('fs'),
     winston       = require('winston'),
     validator     = require('validator'),
     kue           = require('kue'),
     jobs          = kue.createQueue();

// Hacky. This will hold job objects that are currently running.
var pendingJobs = {};


module.exports = function (app, config, cacheService){

  /**
   * Build an options object from the request query.
   */
  var numOptions  = ['width', 'height', 'delay'],
      boolOptions = ['fullpage', 'scrollbar', 'force'],
      strOptions  = ['format', 'callback'];

  var buildOptions = function(query, defaults){
    var options = {};

    // Add numOptions
    numOptions.forEach(function(item){
      if (!!query[item]){
        var value = parseInt(query[item], 10);
        // Check if limit are fullfiled
        if ( 0 < value && value <= defaults['max' + item] ){
          options[item] = value;
        }else{
          throw new Error(item + ' must be bigger than 0 and lesser or equal to ' + defaults['max' + item]);
        }
      }
    });

    // Add strOptions
    strOptions.forEach(function(item){
      if (!!query[item]){
        if (!!defaults['allowed' + item] || defaults['allowed' + item].indexOf(query[item]) != -1){
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
    options.fullpage  = options.fullpage  || defaults.fullpage;
    options.delay     = options.delay     || defaults.delay;
    options.width     = options.width     || defaults.width;
    options.height    = options.height    || defaults.height;

    return options;
  };


  /**
   * Main route.
   */
  app.get('/', function(req, res, next){

    // Issue a
    if (!req.query.url) {
        res.writeHead(404); res.end('At least the URL query must be set.');
        return;
    }

    var url = req.query.url;

    // Assume http:// if nothing is specifiyed.
    if ( url.indexOf('http') === -1 ){
      url = 'http://' + url;
    }

    try{

      if (!validator.isURL(url)){
        throw new Error('Invalid URL: '+ url);
      }

      // Build options from request.
      var options   = buildOptions(req.query, config.screenshot);

      var optionStr = JSON.stringify(options);

      // Create a uniqueID from url, options and the image format
      var image = utils.md5(url + optionStr) + "." + options.format;

      winston.info('Request "%s", cacheId: "%s"', url, image, optionStr);

      // is there a &callback url defined.
      var responseUrl = options.callback;

      // if there is one, answer with 200 OK instantly
      if  (!!responseUrl){

        // Assume http:// if nothing is specifiyed.
        if ( responseUrl.indexOf('http') === -1 ){
          responseUrl = 'http://' + responseUrl;
        }

        if (!validator.isURL(responseUrl)){
          throw new Error('Invalid callback url ' + url);
        }
        res.writeHead(200);
        res.end('Response will be send to '+ responseUrl);
      }


      // &force will invalidate the cache
      if ( options.force ){
        winston.info('Remove "%s" from cache', image);
        cacheService.removeFile(image);
      }

      var serveImage = function(){
        cacheService.getFile(image).pipe(res);
      };

      if ( cacheService.hasFile(image) ){

        winston.info('Server image "%s" from cache', image);
        serveImage();
      } else {

        var attachListenerTo = function(job){
          job.on('complete', function(){
            // remove from pending job list.
            delete pendingJobs[image];

            winston.info("server new image");
            cacheService.addFile(image);

            serveImage();
          });

          job.on('failed', function(error){
           winston.info('' + error);
           res.writeHead(503);
           res.end(''+error);
          });
        };

        // See if there is a job pending
        if ( pendingJobs[image] ) {

          winston.info('attach to a pending screenshot job #%s', pendingJobs[image].id);

          // just attach to the pending jobs
          attachListenerTo(pendingJobs[image]);

        } else {

          winston.info("create a new job");

          // Create a new job and attach to it.
          var job = jobs.create('screenshot', { title : url, id : image , options : options } ).save();
          pendingJobs[image] = job;
          attachListenerTo(job);

        }

      }


    } catch ( error ){
      winston.info ( '' + error );
      res.writeHead(503);
      res.end('' + error);
    }
  });
};