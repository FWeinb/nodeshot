var ScreenshotApi = require('./lib/ScreenshotApi.js'),

    fs            = require('fs'),
    path          = require('path'),

    winston       = require('winston'),
    config        = require('config'),

    kue           = require('kue'),
    jobs          = kue.createQueue();

var cwd = process.cwd();

var configFolder = path.resolve(cwd, config.folder);
// Create the temp directory
if (!fs.existsSync(configFolder)){
  winston.info('"%s" folder not found. Make sure the server configuration is correct.', configFolder);
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

        job.log( '' + err );
        done ( err );

      } else {

        job.log('Cache Request ' + job.data.id);
        job.log('Done');

        stream.pipe(fs.createWriteStream(path.resolve(cwd, config.cache.folder, job.data.id)));
        done();

      }
    });
  } catch ( err ){
    job.log( '' + err );
    done ( err );
  }
});
