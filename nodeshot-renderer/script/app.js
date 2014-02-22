var ScreenshotApi = require('./lib/ScreenshotApi.js'),

    fs            = require('fs'),

    winston       = require('winston'),
    config        = require('config'),

    kue           = require('kue'),
    jobs          = kue.createQueue();


if ( !!config.logging )
  winston.add(winston.transports.File, config.logging );

winston.info('--- Starting Renderer ---');

var screenshotApi = new ScreenshotApi(config.screenshot);

jobs.process('screenshot', function(job, done){
  winston.info('Process job "%s"', job.data.title);
    try{
    screenshotApi.screenshot(job.data.title, job.data.options, job, function(err, stream){
      if ( err ){
        job.log( '' + err );

        done(err);

      } else {

        job.log('Cache Request ' + job.data.id);
        job.log('Done');

        stream.pipe(fs.createWriteStream(config.cache.folder + '/' + job.data.id));
        done();

      }
    });
  } catch ( err ){
    job.log( '' + err );
    done ( err );
  }
});
