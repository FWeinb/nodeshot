var  utils         = require('./../lib/utils.js'),
     buildOptions  = require('./../lib/buildOptions.js'),
     fs            = require('fs'),
     winston       = require('winston'),
     validator     = require('validator'),
     kue           = require('kue'),
     jobs          = kue.createQueue();


module.exports = function (app, config, pendingJobs, cacheService){


  var normalizeReq = function ( req, res, next ){
      if (!req.query.url) {

        throw new Error('At least the URL param must be set.');

      } else {

        var url = req.query.url;

        // Assume http:// if nothing is specified.
        if ( url.indexOf('http') === -1 ){
          url = 'http://' + url;
        }

        if (!validator.isURL(url)){
          throw new Error('Invalid URL: '+ url);
        }

        // Build options from request.
        var options   = buildOptions(req.query, config.screenshot);
        var optionStr = JSON.stringify(options);

        // Create a uniqueID from url, options and the imageId format
        var imageId = utils.md5(url + optionStr) + "." + options.format;

        winston.info('Request "%s", cacheId: "%s"', url, imageId, optionStr);


        // &force will invalidate the cache
        if ( options.force ){
          winston.info('Remove "%s" from cache', imageId);
          cacheService.removeFile(imageId);
        }

        req.screenshot = {
          url     : url,
          options : options,
          imageId : imageId
        };

        // Execute next
        next();
     }
  };



  var attachListenerTo = function(job, imageId, serveImageCallback){
    job.on('complete', function(){
      // remove from pending job list.
      delete pendingJobs[imageId];

      winston.info("server new image");
      cacheService.addFile(imageId);

      serveImageCallback(null, imageId);
    });

    job.on('failed', function(){
      kue.Job.get(job.id, function(err, job){
        if ( err ){
          serveImageCallback(err, null);
          return;
        }
        serveImageCallback(job._error, null);
      });
      // remove from pending job list.
      delete pendingJobs[imageId];
    });
  };

  var createOrAttachToJob = function ( url, imageId, options, serveImageCallback ){

    if ( cacheService.hasFile(imageId) ){

      winston.info('Server image "%s" from cache', imageId);
      serveImageCallback(null, imageId);

    } else {

      // See if there is a job pending
      if ( pendingJobs[imageId] ) {

        winston.info('attach to a pending screenshot job #%s', pendingJobs[imageId].id);

        // just attach to the pending jobs
        attachListenerTo(pendingJobs[imageId], imageId,  serveImageCallback);

      } else {

        winston.info("create a new job");

        // Create a new job and attach to it.
        var job = jobs.create('screenshot', { title : url, id : imageId , options : options } ).save();
        pendingJobs[imageId] = job;
        attachListenerTo(job, imageId, serveImageCallback);

      }
    }

  };


  /**
   * Main route.
   */
  app.get('/', normalizeReq, function(req, res, next){
      var serveImage = function(error, id){
        if ( error ) {
          next(error);
          return;
        }
        cacheService.getFile(id).pipe(res);
      };

      createOrAttachToJob(req.screenshot.url, req.screenshot.imageId, req.screenshot.options, serveImage);

  });

  app.get('/ajax', normalizeReq, function(req, res, next){

    var serverJsonResult = function(error, id){

      if ( error ) {
        next(error);
        return;
      }

      res.writeHead(200, {"Content-Type" : "application/json"});

      var  domainPort;
      if ( config.server.port !== "80"){
        domainPort =  config.server.domain + ':' + config.server.port;
      } else {
        domainPort =  config.server.domain;
      }

      res.end(JSON.stringify({
        request : "success",
        url :  domainPort + '/image/' + id
      }));
    };

    createOrAttachToJob(req.screenshot.url, req.screenshot.imageId, req.screenshot.options, serverJsonResult);
  });


  app.get('/image/:id', function(req, res, next){

    if ( cacheService.hasFile(req.params.id) ){

      cacheService.getFile(req.params.id).pipe(res);

    }else{

      res.writeHead(404);
      res.end();

    }
  });



};