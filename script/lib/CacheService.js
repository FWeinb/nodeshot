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
    winston.debug('Reload cached from filesystem');
    var files = fs.readdirSync(config.folder);
    files.forEach(function(id){
      this.storeFile(id);
    }.bind(this));
  }
};

CacheService.prototype.getCachedOrCreate = function ( fileId, serveCallback, createCallback ) {
  if (!!this.files[fileId]){
    winston.info('Serve file "%s" from cache', fileId);
    serveCallback(fs.createReadStream(this.config.folder + '/' + fileId));
  } else {
    createCallback( function ( stream ){
      this.storeFile ( fileId, stream );
      serveCallback(stream);
    }.bind(this));
  }
};

CacheService.prototype.storeFile = function( fileId, stream ) {
  if (!!this.files[fileId]) {
    return;
  }

  if ( stream )
    stream.pipe(fs.createWriteStream(this.config.folder + '/' + fileId));

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
  if (!this.files[fileId]) {
    return;
  }
  delete this.files[fileId];
  try {
    fs.unlinkSync(this.config.folder + '/' + fileId);
  } catch(e) {
    console.error(e);
  }
};

CacheService.prototype.removeAllFiles = function() {
  for (var fileId in this.files) {
    this.removeFile(fileId);
  }
};

module.exports = CacheService;