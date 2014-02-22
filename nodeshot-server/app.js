var CacheService  = require('./lib/CacheService.js'),

    express       = require('express'),
    config        = require('config'),

    winston       = require('winston'),
    kue           = require('kue');


var cacheService  = new CacheService(config.cache),
    jobs          = kue.createQueue(),
    app           = express();

if ( !!config.logging )
  winston.add(winston.transports.File, config.logging );

winston.info("--- Starting Server ---");

// Basic configuration
if (config.server.cors){
  app.use(function(req, res, next) {
      res.header('Access-Control-Allow-Origin', '*');
      res.header('Access-Control-Allow-Methods', 'GET,PUT,POST,DELETE');
      res.header('Access-Control-Allow-Headers', 'Content-Type');

      next();
  });
}

// Add kue
if ( config.server.kue.show ){
  app.use('/kue', express.basicAuth(config.server.kue.username, config.server.kue.password));
  app.use('/kue', kue.app);
}

app.use(app.router);

// Require the main route
require('./routes/index.js')(app, config, cacheService);
require('./routes/options.js')(app, config);

// Start application
app.listen(config.server.port);

winston.info('Server running on port %d', config.server.port);
