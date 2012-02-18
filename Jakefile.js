// learned a lot from StartupDataTrends Jakefile, 
// thanks you https://github.com/bocoup/StartupDataTrends

var 
  fs = require( "fs" ),
  _ = require( "underscore" ),
  requirejs = require('requirejs'),
  jshint = require( "jshint" ).JSHINT,
  colors = require( "colors" ),
  uglifyjs = require( "uglify-js" ),
  minimatch = require('minimatch'),
  jade = require('jade'),
  stylus = require('stylus'),
  Handlebars = require('handlebars'),
  Buffer = require( "buffer" ).Buffer,  
  dateFormat = require( "dateformat" ),
  cp = require("child_process"),
  exec = cp.exec,
  spawn = cp.spawn,
  assert = require( "assert" ),
  child;
  
var config = {
  "dist": {
    "libs": "out/libs.js",
    "scripts": "views/scripts.xml",
    "app": "out/mushroom.js",
    "jade": "out/index.html"
  },
  "src": [
    "public/javascripts/modules/*",
    "public/javascripts/main.js",
    "public/javascripts/sortive.js"
  ],
  "libs": {
    "include": [
      "public/javascripts/libs/*",
      "public/javascripts/sortive.js"
    ],
    "exclude": [
      "public/javascripts/libs/jsonselect.js",
      "public/javascripts/libs/modernizr*",
      "public/javascripts/libs/popcorn*"
    ],
    "priorities": {
      "public/javascripts/libs/jquery-1*.js": 1,
      "public/javascripts/libs/underscore*.js": 1,
      "public/javascripts/libs/require*.js": -1
    },
    "attributes": {
      "public/javascripts/libs/require.js": {
        "data-main": "/javascripts/main"
      }
    }
  },
  
  
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


//_.extend(config, readJSON('build.json'));


// function readJSON(filePath) {
//   console.log('about to read ' + filePath.underline);
//   try{
//     var content = readFile(filePath);
//     return JSON.parse(content);
//   }catch(e) {
//     fail(e);
//   }
// }



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

var getLibs = (function(){
  var libs;
      
  return function() {
    if(libs) {
      return libs;
    }
    
    var fileLists = new jake.FileList(),
      priorities = config.libs.priorities;
      
    fileLists.include(config.libs.include);
    fileLists.exclude(config.libs.exclude);

    libs = _.sortBy(fileLists.toArray(), function(path){
        
      for(var matcher in priorities) {
        if(minimatch(path, matcher)) {
          console.log('match : ' + path.underline);
          return -priorities[matcher];
        }
      }
      return 0;
    });
    
    return libs;
  };
})();


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


desc('Start Test concat and hint');
task('default', ['hint'], function() {
  console.log('--------------' + 'complete'.green.bold + '--------------' );
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
    // TODO log order
    var body = '',
      libs = getLibs();
      
    libs.forEach(function(path) {
      console.log('opening : ' + path.underline);      
      var content = readFile(path);
      body += '\n' + content +'\n';
    });
    // after load require.js,, where to ....
    writeFile(config.dist.libs, body);
    console.log('---concat complete---'.yellow);            
  });
  
  desc('out put libs to script tag');
  task('script', function() {
    console.log('about to export library script tags');
    var attributes = config.libs.attributes;
    Handlebars.registerHelper('src', function(src) {
      var arr = src.split('public');
      return arr[1];
    });
    
    Handlebars.registerHelper('attributes', function(filePath) {
      for(var matcher in attributes) {
        if(minimatch(filePath, matcher)) {
          var data = attributes[matcher],
            ret = '';          
          for(var key in data) {
            ret += ' ' + key + '="' + data[key] + '" ';
          }
          return ret;
        }
      }
      return '';
    });
    
    var libs = getLibs(),
      temp = '{{# each libs }}' + 
              '<script src="{{ src this }}" {{{ attributes this }}} ></script>\n' +
            '{{/ each }}';    
            
      template = Handlebars.compile(temp);
      
      body = template({
        libs: libs
      });
      
      console.log('body : \n' + body);
      writeFile(config.dist.scripts, body);
      console.log('complete'.yellow);
  });  
  
  desc('jade to html')
  task('jade', function() {
    var body = readFile('views/layout.jade'),
    template = jade.compile(body, {
      filename: 'views/layout.jade'
    });
    
    var output = template({
      title: 'home',
      view: 'home',
      body: 'views/home.jade',
      scripts: 'scripts.min.xml'
    });
    
    writeFile('out/index.html', output);
    console.log('complete'.yellow);
  });
  
  desc('stylus to css');
  task('stylus', function() {
    var str = readFile('stylesheets/home.styl');
    stylus(str)
      .import(__dirname + '/stylesheets/mixins')
      .set('paths', [__dirname + '/stylesheets'])
      .set('filename', 'out/style.css')
      .render(function(err, css) {
        if(err) {
          fail(err);
        }
        console.log('css : ' + css);
        writeFile('out/home.css', css);
      });
  });
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


