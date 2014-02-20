var express       = require('express'),

    request       = require('request'),
    config        = require('config'),

    winston       = require('winston'),

    CacheService  = require('./lib/CacheService.js'),
    ScreenshotApi = require('./lib/ScreenshotApi.js');


if ( !!config.logging )
  winston.add(winston.transports.File, config.logging );

winston.info("--- Starting ---");

var cacheService  = new CacheService(config.cacheService);
var screenshotApi = new ScreenshotApi(config.screenshot);

var app = express();

// Basic configuration
if (config.server.cors){
  app.use(function(req, res, next) {
      res.header('Access-Control-Allow-Origin', '*');
      res.header('Access-Control-Allow-Methods', 'GET,PUT,POST,DELETE');
      res.header('Access-Control-Allow-Headers', 'Content-Type');

      next();

  });
}

app.use(app.router);

// Require the main route
require('./routes/index.js')(app, config, screenshotApi, cacheService);
require('./routes/options.js')(app, config);

// Start application
app.listen(config.server.port);
winston.info('Server running on port %d', config.server.port);
