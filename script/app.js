var express       = require('express'),
    request       = require('request'),
    config        = require('config'),

    CacheService  = require('./lib/CacheService.js'),
    ScreenshotApi = require('./lib/ScreenshotApi.js');

var cacheService  = new CacheService(config.cacheService);
var screenshotApi = new ScreenshotApi(config.screenshot);

var app = express();

// Basic configuration
app.configure(function(){
 app.use(app.router);
});

// Require the main route
require('./routes/index.js')(app, config, screenshotApi, cacheService);

// Start application
app.listen(config.server.port);
console.log('Screenshot Server: ' + config.server.port);
