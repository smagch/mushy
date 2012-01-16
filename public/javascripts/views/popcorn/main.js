require.config({
    'baseUrl' : '/javascripts'
  , 'paths' : {
        'jQuery' : 'libs/jquery/main'
      , 'underscore' : 'libs/underscore/underscore-min'
      , 'backbone' : 'libs/backbone/main'
      , 'popcorn' : 'libs/popcorn/main'
    }
});
// TODO 1. build just output text ui 
// TODO 2. and then build make them span tool
// TODO 3. and then build glue and sissor tool
// TODO 4. and then make them work with popcorn
// TODO 5. build slider and so on
require(['jQuery', 'underscore', 'backbone', 'popcorn'], function ($, _, Backbone, Popcorn) {
    console.log('loaded');
    
    
});

