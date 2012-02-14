var 
  fs = require( "fs" ),
  _ = require( "underscore" ),
  jshint = require( "jshint" ).JSHINT,
  colors = require( "colors" ),
  uglifyjs = require( "uglify-js" ),
  Buffer = require( "buffer" ).Buffer,  
  dateFormat = require( "dateformat" ),
  cp = require("child_process"),
  exec = cp.exec,
  spawn = cp.spawn,
  assert = require( "assert" ),
  child;
  
var config = {
  src: [
    'public/javascripts/modules/*',
    'public/javascripts/main.js',
    'public/javascripts/sortive.js'
  ],
  //'dest': 'public/javascripts/MR.js',
  //'dest-min': 'public/javascripts/MR.min.js',  
  jshint: {
    predef: [ "_", "$", "Backbone", "jQuery", 'marked', 'require', 'define'],
    // Environments
    browser: true,
    forin: false,
    undef: true,
    trailing: true,
    // Relaxing Options
    eqnull: true,
    boss: false,
    sub: true,
    expr: true,
    // Enforcing Options
    newcap: true,
    curly: true,
    latedef: true,
    nonew: true
    // Legacy
  },
  // Uglify Optional Settings
  uglify: {
    "mangle": {
      "except": [ "_", "$", 'define', 'require']
    },
    "squeeze": {},
    "codegen": {}
  }
}

function hint( src, path ) {
  console.log('about to jshint : ' + path);
  if (jshint( src, config.jshint)) {
    console.log('ok'.green.bold);
  } else {
    console.log('-------fail jshint-------'.red);
    console.log('jshint.errors.length : '.red + jshint.errors.length + ' length'.red);
    
    jshint.errors.forEach(function(e) {
      if (!e) { return; }
      var str = e.evidence ? e.evidence.inverse : "";

      str = str.replace( /\t/g, " " ).trim();
      console.log( path + " [L" + e.line + ":C" + e.character + "] " + e.reason + "\n  " + str );
    });
    fail('hint failed!'.red);
  }
}

function readFile( filepath ) {
  var src;
  try {
    src = fs.readFileSync( filepath, "UTF-8" );
    return src;
  } catch(e) {
    fail(e);
  }
}


desc('Start Test concat and hint');
task('default', ['hint'], function() {
  console.log('--------------' + 'complete'.green.bold + '--------------' );  
});


desc('hint');
task('hint', function() {
  console.log('about to hint');
  var list = new jake.FileList();
  list.include(config.src);
  console.log('about to jshint files : \n' + list.toArray().join('\n').toString().underline);  
  list.toArray().forEach(function(filePath) {
    var body = readFile(filePath);
    hint(body, filePath);
  });
});

