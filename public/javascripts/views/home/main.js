require.config({
    'baseUrl' : '/javascripts'
  , 'paths' : {
        'jQuery' : 'libs/jquery/main'
      , 'underscore' : 'libs/underscore/underscore'
      , 'backbone' : 'libs/backbone/main'
    }
});

require(['jQuery', 'underscore', 'backbone' ], function ($, _, Backbone) {
    $(document).ready(function () {
      
    

    var TweetModel = Backbone.Model.extend({
        url : function () {
            return "http://search.twitter.com/search.json?q=" + this._query + "&callback=?";
        }
      , doQuery : function( queryString ) {
            if( queryString && 
                this._query !== queryString && 
                queryString.length > 0 &&
                queryString.length < 50 ) {
                  
                this._query = queryString;
                this.fetch();
            }            
        }
    });    
    
    var TweetView = Backbone.View.extend({
        el : $('#search-twitter-content')
      , initialize : function ( options ) {
            this.model.bind('change', this.render, this);
            //this.model = options.model;
        }
      , events : {
            
        }
      , template : _.template($('#twitter-template').html())
      , render : function () {
            console.log('render');
            console.dir(this.model.get('results'));
            this.el.html( this.template({results : this.model.get('results') }));
        }        
    });
    
    var FacebookModel = Backbone.Model.extend({
        url : function() {
            return 'https://graph.facebook.com/search?type=post&limit=20&q=' + this._query + '&offset=10&callback=?';            
        }

      , doQuery : function( queryString ) {
            if( this._query !== queryString && queryString != '' ) {
                this._query = queryString;
                this.fetch();
            }            
        }
    });    
    
    var FacebookView = Backbone.View.extend({
        el : $('#search-facebook-content')
      , initialize : function( options ) {
            this.model.bind( 'change', this.render, this );
           // this.model = options.model;
        }
      , events : {
        
        }
      , template : _.template($('#facebook-template').html())
      , render : function() {
            console.log('render');
            console.dir( this.model.get('data') );
            this.el.html( this.template( { results : this.model.get('data') } ));
        }
    });
    
    var AppView = Backbone.View.extend({
        el : $('#content')
      , initialize : function () {
            // $('#search-tab > li').on('click', function (e) {
            //                 $('#search-categories .active').removeClass('active');
            //                 $('#'+this.id+'-category').addClass('active');
            //                 $(this).addClass('selected').siblings().removeClass('selected');        
            //             });

            $('#search-categories span').on('click', function (e) {        
                $(this).addClass('selected').siblings().removeClass('selected');
            });            
            $('#facebook-list').css('display', 'block');
            
            this.views.twitter = new TweetView( { model : this.models.twitter });
            this.views.facebook = new FacebookView( { model : this.models.facebook });
        }
      , currentKey : 'twitter'
      , models : {
            'twitter' : new TweetModel()
          , 'facebook' : new FacebookModel()
        }
      , views : {
            'twitter' : undefined
          , 'facebook' : undefined
        }
      , currentModel : function() {
            return this.models[ this.currentKey ];
        }
      , currentView : function() {
            return this.views[ this.currentKey ];
        }
      , events : {
            'keyup #search-input' : 'query'
          , 'click #search-tab > li' : 'tabChange'
          //, 'click #seach-categories span' : 'categoryChange'
        }
        
      , tabChange : function( e ) {
            console.log('tabChn');
            $( e.target ).addClass( 'selected' ).siblings().removeClass('selected');
            var id = e.target.id;
            $( '#' + id + '-category' ).addClass( 'active' ).siblings().removeClass( 'active' );                        
            $( '#' + id + '-content' ).addClass( 'active' ).siblings().removeClass( 'active' );
            var key = id.split('-')[1];
            this.currentKey = key;
            
            this.query({ keyCode : 13 });            
        }
      // , categoryChange : function() {
      //         
      //     }
      , query : function( e ) {          
            if( e.keyCode === 13 ) {
                var val = $('#search-input').val();                
                this.currentModel().doQuery( val );
                //tweetList.query = val;
                //tweetList.fetch();
                //facebookList.query = val;
                //facebookList.fetch();
            }
        }
      , render : function () {
        
        }
    
    });
    
    // var tweetList = new TweetModel();
    // var tweetView = new TweetView({ model : tweetList });
    // var facebookList = new FacebookModel();
    // var facebookView = new FacebookView( { model : facebookList } );
    var app = new AppView();
    
    });
    
});