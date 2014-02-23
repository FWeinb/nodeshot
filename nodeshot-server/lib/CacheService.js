var fs        = require('fs'),
    path      = require('path'),
    winston   = require('winston');

var cwd = process.cwd();

var CacheService = function( config ) {
  this.config = config;
  this.files  = {};

  var configFolder = path.resolve(cwd, config.folder);

  // Create the temp directory
  if (!fs.existsSync(configFolder))
    fs.mkdirSync(configFolder);

  winston.info('Cache folder "%s"', configFolder );

  // Should the cache be reloaded?
  if ( config.reload ) {
    winston.info('Reload cache from filesystem');
    var files = fs.readdirSync(config.folder);
    files.forEach(function(id){
      this.addFile(id);
    }.bind(this));
  }
};

CacheService.prototype.hasFile = function(fileId){
  return !!this.files[fileId];
};

CacheService.prototype.getFile = function(fileId){
  return fs.createReadStream(path.resolve(cwd, this.config.folder, fileId));
};

CacheService.prototype.addFile = function( fileId ) {
  if ( this.hasFile(fileId) ) return;

  this.files[fileId] = true;

  // Setup ttl timeout
  if ( this.config.ttl > 0){
    setTimeout(function() {
      winston.info('Cache timeout for %s', fileId);
      this.removeFile(fileId);
    }.bind(this), this.config.ttl);
  }

};

CacheService.prototype.removeFile = function( fileId ) {
  if (!this.hasFile(fileId)) return;

  delete this.files[fileId];

  try {

    fs.unlinkSync(path.resolve(cwd, this.config.folder, fileId));

  } catch(e) {
    winston.info(e);
  }
};

CacheService.prototype.removeAllFiles = function() {
  for (var fileId in this.files) {
    this.removeFile(fileId);
  }
};

module.exports = CacheService;