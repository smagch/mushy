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
      
    var QueryModel = Backbone.Model.extend({
        doQuery : function( queryString ) {
            if( queryString && 
                this._query !== queryString && 
                queryString.length > 0 &&
                queryString.length < 50 ) {
                this._query = queryString.replace(/\s+/g, '+');
                this.fetch();
            }            
        }
    });
    
    var TweetModel = QueryModel.extend({
        url : function () {
            return "http://search.twitter.com/search.json?q=" + this._query + "&callback=?"
        }     
    });
    
    var TweetImageModel = QueryModel.extend({
        url : function() {
            return 'http://otter.topsy.com/searchdate.json?q=' + this._query + '&geocode=&type=image&perpage=16&callback=?';
        }
    });    
    
    
    var TweetView = Backbone.View.extend({
        el : $('#search-twitter-timeline-content')
      , initialize : function ( options ) {
            this.model.bind('change', this.render, this);
        }
            
      , template : _.template($('#twitter-template').html())
   
      , render : function () {
            console.log('render');
            this.el.html( this.template({ results : this.model.get('results') }));
        }        
    });
    
    var TweetImageView = Backbone.View.extend({
        el : $('#search-twitter-image-content')
      , initialize : function() {
            this.model.bind( 'change', this.render, this );
        }
      , template : _.template($('#image-template').html())
      , render : function() {
            console.log('render');
            var results = this.model.get('response');
            
            this.el.html( this.template({ results : results.list }) );
        }
    });

    
    var FacebookModel = QueryModel.extend({
        url : function() {
            return 'https://graph.facebook.com/search?type=post&limit=20&q=' + this._query + '&offset=10&callback=?';            
        }    
    });    
    
    var FacebookView = Backbone.View.extend({
        el : $('#search-facebook-content')
      , initialize : function( options ) {
            this.model.bind( 'change', this.render, this );
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
    
    var TabTracker = (function(){
        var _key = 'twitter-timeline'
          , categoryTempl = _.template('#search-<%= firstkey %>-categories > span.selected')  
          , templates = [
              _.template( '#search-<%= firstKey %>-categories' )
            , _.template( '#search-<%= key %>-content' )
          ];
          
        function update () {
            var options = {
                key : _key
              , firstKey : _key.split('-')[0]
            }
            _.each( templates, function( template ) {
                var selector = template( options );
                console.log('selector : ' + selector);
                $( selector ).addClass( 'active' )
                    .siblings( '.active' ).removeClass( 'active' );
            });
        }                                                                          
        return {
            setKey : function( key ) {
                var keys = [ key ];
                var categorySelector = categoryTempl({ firstkey : key });
                var category = $(categorySelector).text().replace( /\s+/g, '' );
                ( category !== '' ) && ( keys.push( category ) );
                
                _key = keys.join('-');
                console.dir(keys);
                update();
            }
          , setCategory : function( category ) {
                var keys = _key.split('-');
                keys[1] = category;
                _key = keys.join('-');
                update();
            }
          , getKey : function() {                
                return _key;
            }
        }        
    })();
    // var TabModel = Backbone.Model.extend({
    // 
    //     set : function( attributes, options ) {
    //         
    //         if( attributes.key && !attributes.category ) {
    //             attributes.category = $(this.categorySelector({ key : attributes.key })).text().replace(/\s+/g);
    //         }
    //         
    //         Backbone.Model.prototype.set.call( this, attributes, options );
    //     }
    //   , initialize : function() {
    //         this.set({
    //             key : 'twitter'
    //           , category : 'timeline'
    //         }, {
    //             silent : true
    //         });
    //     }
    //   , categorySelector : _.template('#search-<% key %>-category.active > span.selected')    
    // });
    // 
    // var TabView = Backbone.View.extend({
    //     initialize : function() {
    //         this.model.bind( 'change', this.render, this );
    //     }
    //   , templates : [            
    //         _.template( '#search-<%= key %>-category' )
    //       , _.template( '#search-<%= key %>-content-<%= category %>' )
    //     ]categories
    //   //, categorySelector : _.template('#search-<% key %>-category.active > span.selected')
    //   , keySelector : _.template('#search-tab > search-<%= key %>')
    //   
    //   , render : function( model ) {
    //         var key = model.get('key')
    //           , category = model.get( 'category' );      
    //        
    //        console.log('key : ' + key);
    //        console.log('category : ' + category);            
    //        var obj = {
    //            key : key
    //          , category : category
    //        } 
    //        _.each( this.templates, function( template ) {
    //            var selector = template( obj );
    //            $( selector )
    //              .addClass( 'active' )
    //              .siblings( '.active' ).removeClass( 'active' );                                 
    //        });
    //     }
    // });
    
    var AppView = Backbone.View.extend({
        el : $('#content')
      , initialize : function () {            

            $('#search-categories').on('click', 'span', _.bind( this.categoryChange, this ) );

            $('#facebook-list').css('display', 'block');
            
            
            this.views['twitter-timeline'] = new TweetView({ model : this.models[ 'twitter-timeline' ]});
            this.views['twitter-image'] = new TweetImageView({ model : this.models[ 'twitter-image'] });
            this.views['facebook'] = new FacebookView({ model : this.models['facebook'] });
            
        }
      , models : {
            'twitter-timeline' : new TweetModel()
          , 'twitter-image' : new TweetImageModel()
          , 'facebook' : new FacebookModel()
        }
      , views : {  }
      , currentModel : function() {
            var key = TabTracker.getKey();
            return this.models[key];
        }
      , currentView : function() {
            return this.views[ this.currentKey ];
        }
      , events : {
            'keyup #search-input' : 'query'
          , 'click #search-tab > li' : 'tabChange'
         // , 'click #seach-categories span' : 'categoryChange'
        }
        
      , tabChange : function( e ) {
            console.log('tabChn');
            $( e.target ).addClass( 'selected' )
                .siblings('.selected').removeClass('selected');
            var id = e.target.id;
            var key = id.split('-')[1];
            TabTracker.setKey( key );
            this.query({ keyCode : 13 });            
        }
      , categoryChange : function( e ) {
            console.log('categoryChange');            
            
            var category = $( e.target )
                  .addClass('selected')
                  .siblings().removeClass('selected')
                  .end().text()
                  .replace(/\s+/g, '');
            
            console.log('category : ' + category);
            
            TabTracker.setCategory( category );
            this.query( { keyCode : 13 });  
        }
      , query : function( e ) {          
            if( e.keyCode === 13 ) {
                var val = $('#search-input').val();                
                this.currentModel().doQuery( val );               
            }
        }
      , render : function () {
        
        }
    
    });
    
   
    var app = new AppView();
    
    });
    
});