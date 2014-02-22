var fs      = require('fs'),
    winston = require('winston');

var CacheService = function( config ) {
  this.config = config;
  this.files  = {};

  // Create the temp directory
  if (!fs.existsSync(config.folder))
    fs.mkdirSync(config.folder);

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
  return fs.createReadStream(this.config.folder + '/' + fileId);
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

    fs.unlinkSync(this.config.folder + '/' + fileId);

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