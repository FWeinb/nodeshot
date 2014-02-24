
/**
 * Build an options object from the request query.
 */
var numOptions  = ['width', 'height', 'delay'],
    boolOptions = ['fullpage', 'scrollbar', 'force'],
    strOptions  = ['format', 'callback'];

var buildOptions = function(query, defaults){
  var options = {};

  // Add numOptions
  numOptions.forEach(function(item){
    if (!!query[item]){
      var value = parseInt(query[item], 10);
      // Check if limit are fullfiled
      if ( 0 < value && value <= defaults['max' + item] ){
        options[item] = value;
      }else{
        throw new Error(item + ' must be bigger than 0 and lesser or equal to ' + defaults['max' + item]);
      }
    }
  });

  // Add strOptions
  strOptions.forEach(function(item){
    if (!!query[item]){
      if (!!defaults['allowed' + item] || defaults['allowed' + item].indexOf(query[item]) != -1){
        options[item] = query[item];
      } else{
        throw new Error( item + ' must be one of these values: ' + defaults['allowed' + item]);
      }
    }
  });

  // Add boolOptions
  boolOptions.forEach(function(item){
    if (!!query[item]){
      options[item] = false;
      switch(query[item].toLowerCase()){
          case "true":
          case "yes":
          case "1":
            options[item] = true;
        }
    }
  });


  // Merge in defaults
  options.format    = options.format    || defaults.format;
  options.scrollbar = options.scrollbar || defaults.scrollbar;
  options.fullpage  = options.fullpage  || defaults.fullpage;
  options.delay     = options.delay     || defaults.delay;
  options.width     = options.width     || defaults.width;
  options.height    = options.height    || defaults.height;

  return options;
};


module.exports = buildOptions;