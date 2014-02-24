var ScreenshotApi = require('./lib/ScreenshotApi.js'),

    fs            = require('fs'),
    path          = require('path'),

    winston       = require('winston'),
    config        = require('config'),

    kue           = require('kue'),
    jobs          = kue.createQueue();

var cwd = process.cwd();

var cacheFolder = path.resolve(cwd, config.cache.folder);
// Warn if cache folder dosn't exist
if (!fs.existsSync(cacheFolder)){
  winston.info('"%s" folder not found. Make sure the server configuration is correct.', cacheFolder);
}


if ( !!config.logging )
  winston.add(winston.transports.File, config.logging );

winston.info('--- Starting Renderer ---');

var screenshotApi = new ScreenshotApi(config.screenshot);

jobs.process('screenshot', function(job, done){
  winston.info('Process job "%s"', job.data.title);

  var canceled = false,
      globalTimeout = setTimeout(function(){
        canceled = true;
        done ( new Error('Request took longer than ' + config.screenshot.globaltimeout + 'ms') );
      }, config.screenshot.globaltimeout);

    try{

    screenshotApi.screenshot(job.data.title, job.data.options, job, function(err, stream){
      clearTimeout(globalTimeout);
      if ( canceled ) return;

      if ( err ){

        done ( '' + err );

      } else {

        job.log('Cache Request ' + job.data.id);
        job.log('Done');

        stream.pipe(fs.createWriteStream(path.resolve(cacheFolder, job.data.id)));
        done();

      }
    });
  } catch ( err ){
    done ( '' + err );
  }
});
