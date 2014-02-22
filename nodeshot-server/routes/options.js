
module.exports = function (app, config){

  app.get('/options', function(req, res, next){

    res.writeHead(200, {'Content-Type' : 'application/json'});
    res.end(JSON.stringify(config.screenshot));
  });

};