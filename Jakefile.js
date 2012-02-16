var 
  fs = require( "fs" ),
  _ = require( "underscore" ),
  requirejs = require('requirejs'),
  jshint = require( "jshint" ).JSHINT,
  colors = require( "colors" ),
  uglifyjs = require( "uglify-js" ),
  minimatch = require('minimatch'),
  Buffer = require( "buffer" ).Buffer,  
  dateFormat = require( "dateformat" ),
  cp = require("child_process"),
  exec = cp.exec,
  spawn = cp.spawn,
  assert = require( "assert" ),
  child;
  
var config = {
  dist: {
    libs: 'out/libs.js',
    app: 'out/mushroom.js'
  },
  src: [
    'public/javascripts/modules/*',
    'public/javascripts/main.js',
    'public/javascripts/sortive.js'
  ],
  libs: {
    include: [
      'public/javascripts/libs/*',
      'public/javascripts/sortive.js',
    ],
    // currently doesn't used
    exclude: [
      'public/javascripts/libs/jsonselect.js',
      'public/javascripts/libs/modernizr*',
      'public/javascripts/libs/popcorn*'
    ],
    // make sure plugin script to load after prioratized script
    // default 0, using minimatch
    priorities: {
      'public/javascripts/libs/jquery-1*.js': 1,
      'public/javascripts/libs/underscore*.js': 1
    }
  },
  //'dest': 'public/javascripts/MR.js',
  //'dest-min': 'public/javascripts/MR.min.js',  
  jshint: {
    predef: [ "_", "$", "Backbone", "jQuery", 'require', 'define',
      'marked', 'Handlebars', 'swfobject'
    ],
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
  console.log('about to jshint : ' + path.underline);
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

function readFile(filepath) {
  var src;
  try {
    src = fs.readFileSync( filepath, "UTF-8" );
    return src;
  } catch(e) {
    fail(e);
  }
}

function writeFile(filePath, contents) {
  console.log('about to write into : ' + filePath.underline);
  try {
    fs.writeFileSync(filePath, contents, "UTF-8");
  } catch( e ) {
    fail( e );
  }
  console.log('ok');
}


desc('Start Test concat and hint');
task('default', ['hint'], function() {
  console.log('--------------' + 'complete'.green.bold + '--------------' );
});

desc('test just a test');
task('test', function() {
  console.log('about to test');
  var deps = [ 'hoge', 'foo', 'smagch', '33f', 'fadsf'];
  var libs = ['jquery'];
  var priorities = {
    smagch: 1,
    foo: 1
  };
  function comparator(val) {
    return - priorities[val] || 0;
  }
  var files = new jake.FileList();
  files.include(deps);
  files.include(libs);
  var arr = _.sortBy( files.toArray(), comparator );  
  console.dir( arr );
});





// TODO add min files
// concat libs
// TODO how to make sure that css file exist? currently public/stylesheets is ignored.. should be tracked?
// 1. output css from styl
// 2. output html from jade
// 3. concat minified libs
// TODO 
// 4. ugrify and concat modules reading config,
// output file should contains 
// * one html file
// * one or two js file
// * one css file
// * images
// last ordinary require call to optimized script and see if there is error
namespace('build', function() {
  desc('build module and libs');
  task('all', ['build:module', 'build:libs'], function() {
    console.log('complete'.yellow.underline.bold);
  });
  
  desc('ugrify and concat modules');
  task('module', function() {
    console.log('about to build modules');
    // TODO - add build date and license
    requirejs.optimize({
      baseUrl: __dirname + '/public/javascripts',
      name: 'main',    
      out: config.dist.app
    }, function(res) {
      console.log('------------modules build complete------------'.yellow.underline);
    });
  });
  
  desc('concat libs');
  task('libs', function() {
    console.log('about to concat libs...');
    var libs = new jake.FileList();
    libs.include(config.libs.include);
    libs.exclude(config.libs.exclude);
    
    var priorities = config.libs.priorities,
      arr = _.sortBy(libs.toArray(), function(path){
        
      for(var matcher in priorities) {
        if(minimatch(path, matcher)) {
          console.log('match : ' + path);
          return -priorities[matcher];
        }
      }
      return 0;
    });

    var body = '';
    arr.forEach(function(path) {
      console.log('opening : ' + path.underline);      
      var content = readFile(path);
      body += '\n' + content +'\n';
    });
    // after load require.js,, where to ....
    writeFile(config.dist.libs, body);
    console.log('---concat complete---'.yellow);
  });
});


desc('build modules');
task('')

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


