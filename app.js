
/**
 * Module dependencies.
 */

var express = require('express')
  , stylus = require('stylus')
  ;

var app = module.exports = express.createServer();

// Configuration

app.configure(function(){
  app.set('views', __dirname + '/views');
  app.set('view engine', 'jade');
  app.use(express.bodyParser());
  app.use(express.methodOverride());
  app.use(express.cookieParser());
  app.use(express.session({ secret: 'hoge' }));
  //app.use(require('stylus').middleware({ src: __dirname + '/public' }));
  app.use(stylus.middleware({ 
       src: __dirname
     , dest: __dirname + '/public'
     , compile: compile
  }));
  app.use(app.router);
  app.use(express.static(__dirname + '/public'));
});
function compile(str, path) {
  return stylus(str)
    .import(__dirname + '/stylesheets/mixins')
    .set('filename', path)
    .set('warn', true)
    .set('compress', true);
}

app.configure('development', function(){
  app.use(express.errorHandler({ dumpExceptions: true, showStack: true })); 
});

app.configure('production', function(){
  app.use(express.errorHandler()); 
});



app.get('/', function (req, res) {
   console.log('hoge'); 
   res.render('home', {
      title : 'home'
    , view : 'home'
   });
});

app.get('/test', function( req, res) {
    console.log('test');
    res.render('test', {
        title : 'test'
      , view : 'home'
    });
});
app.get('/popcorn', function (req, res) {
    res.render('popcorn', {
        title : 'popcorn test'
      , view : 'popcorn'
    });
});

app.listen(3000);
console.log("Express server listening on port %d in %s mode", app.address().port, app.settings.env);
