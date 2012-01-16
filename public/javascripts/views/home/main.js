require.config({
    'baseUrl' : '/javascripts'
  , 'paths' : {
        'jQuery' : 'libs/jquery/main'
      , 'underscore' : 'libs/underscore/underscore-min'
      , 'backbone' : 'libs/backbone/main'
    }
});

require(['jQuery', 'underscore', 'backbone' ], function ($, _, Backbone) {
    $(document).ready(function () {
      
    
    $('#search-tab > li').on('click', function (e) {
        $('#search-categories .active').removeClass('active');
        $('#'+this.id+'-category').addClass('active');
        $(this).addClass('selected').siblings().removeClass('selected');
    });
        
    $('#search-categories span').on('click', function (e) {        
        $(this).addClass('selected').siblings().removeClass('selected');
    });
    
    var Tweets = Backbone.Model.extend({
        url : function () {
            return "http://search.twitter.com/search.json?q=" + this.query + "&callback=?";
        }
    });
    
    // var TweetList = Backbone.Collection.extend({
    //      model :  Tweet
    //    , initialize : function (models, options) {
    //          
    //      }
    //   
    //  });
    
    var TweetView = Backbone.View.extend({
        el : $('#tweet-list')
      , initialize : function (options) {
            this.model.bind('change', this.render, this);
            this.model = options.model;
        }
      , events : {
            
        }
      , template : _.template($('#template').html())
      , render : function () {
            console.log('render');
            console.dir(this.model.get('results'));
            this.el.html( this.template({results : this.model.get('results') }));
        }        
    });
    
    var AppView = Backbone.View.extend({
        el : $('#content')
      , initialize : function () {
            $('#search-input').on('keydown', function (e) {
                console.log('keydown');
                var val = $(this).val();
                if(e.keyCode === 13 && val !== '' ) {
                    console.log('val : ' + val);                    
                    tweetList.query = val;
                    tweetList.fetch();
                }                
            });
        }
      , events : {
            
        }
      , render : function () {
        
        }
    
    });
    var tweetList = new Tweets();
    var tweetView = new TweetView({model : tweetList});
    var app = new AppView();
    
    });
    
});