// require.config({
//     'baseUrl' : '/javascripts'
//   , 'paths' : {
//         'jQuery' : 'libs/jquery/main'
//       , 'underscore' : 'libs/underscore/underscore'
//       , 'backbone' : 'libs/backbone/main'
//     }
// });

//require(['jQuery', 'underscore', 'backbone' ], function ($, _, Backbone) {
(function($, _, Backbone, JSONSelect, undefined){
  
    // TODO - design tab
    // TODO - make them draggable
    // TODO - try sortable
    // TODO - datepicker
    
    var noop = function() {};
    // templates
    var Templates = (function(){
      var T = { };
      $("script[type='text/template']").each(function() {
          T[this.id] = _.template($(this).html());
      });
      return T;
    })();
    
    var Models = (function(){
      
        var M = { };
        
        M.TwitterModel = Backbone.Model.extend({});        
        M.TwitterImageModel = Backbone.Model.extend({});
        M.FacebookModel = Backbone.Model.extend({});
        
        return M;
    })();
    
    
    var Collections = (function(){
        var C = { };
        C.QueryCollection = Backbone.Collection.extend({
           
            url : function() {
                if( this.isPaging ) {
                    return this.nextUrl + '&callback=?';
                }
                return this.defaultUrl + '?' + $.param(this.params) + '&callback=?';
            }
          , params : { }
          , queryKey : 'q'
          , _queryString : function(str) {
                if( str === undefined ) {
                    return this.params[this.queryKey];
                }
                this.params[this.queryKey] = str;
            }          
          , query : function(queryString) {
                var q = this._queryString();
                if(!queryString) {
                    return q;
                }                
                this.isPaging = false;
                if( q !== queryString && queryString.length > 0 && queryString.length < 50 ) {
                    this._queryString( queryString );
                    this.isRequesting(true);
                    this.fetch();
                }                                                                
            }
          , queryNext : function() {
                 if( this.nextUrl && !this.isRequesting() ) {                     
                     this.isPaging = true;
                     this.isRequesting(true);
                     this.fetch({
                         add : true
                     });
                 }
             }              
          , isRequesting : function( value ) {
                if( value === undefined ) {
                    return this._isRequesting;
                }
                this._isRequesting = value;
                if( value ) {
                    this.trigger('requeststart');
                } else {
                    this.trigger('requestend');
                }                                
            }
          , nextUrl : undefined
          , hasNext : function() {
                return !!this.nextUrl;                        
            }
   
 
        });
        
        C['twitter-search'] = C.QueryCollection.extend({          
            model : Models.TwitterModel
          , defaultUrl : "http://search.twitter.com/search.json"
          , params : {
                q : ''
            }
          , parse : function( data ) {
                this.isRequesting(false);
                var models = data.results;
                if(data.next_page) {
                     this.nextUrl = 'http://search.twitter.com/search.json' + data.next_page ;
                 } else if( data.refresh_url ){
                     console.log('refresh : ' + this.nextUrl );
                     console.dir( data );
                     this.nextUrl = undefined;
                 } else {
                     this.nextUrl = undefined;
                 }       
                
                return models;
            }
        });
        
        C['twitter-user'] = C.QueryCollection.extend({            
            model : Models.TwitterModel
          , initialize : function() {
                this.on('reset', function() {
                  console.log('user reset');
                }).on('add', function() {
                  console.log('user add');
                });
            }
          , defaultUrl : 'https://api.twitter.com/1/statuses/user_timeline.json'
          , params : {
                include_entities : true
              , include_rts : true
              , screen_name : ''
            }
          , queryKey : 'screen_name'              
          , parse : function( data ) {
                this.isRequesting(false);
                if( this.timeoutId ) {
                    clearTimeout(this.timeoutId);
                    this.timeoutId = undefined;
                }                
                var models = [ ];               
                
                // if Paging, remove first tweet
                if( this.isPaging ) {
                    data.shift();
                }
                
                _.each(data, function( model ) {
                    models.push({
                        text : model.text
                      , profile_image_url : model.user.profile_image_url
                      , from_user : model.user.screen_name
                    });
                });
                
                var lastId = _.last( data )['id_str'];
                
                this.nextUrl = this.defaultUrl + '?' + $.param( _.extend({ max_id : lastId }, this.params) );
                                
                return models;
            }
          , timeoutId : undefined
          , fetch : function( options ) {
                // 4 sec for timeout
                this.timeoutId = setTimeout( _.bind( function() {
                    console.log('timeout');
                    this.timeoutId = undefined;
                    this.reset([]);
                }, this ) , 4000);
                Backbone.Collection.prototype.fetch.call( this, options );
            }
        });
        
        C['twitter-id'] = C.QueryCollection.extend({
            model : Models.TwitterModel
          , defaultUrl : 'https://api.twitter.com/1/statuses/show.json'
          , params : {
                id : ''
              , include_entity : true
            }
          , queryKey : 'id'
          , parse : function( data ) {
                this.isRequesting(false);
                var models = [ ];
                models.push({
                    text : data.text
                  , profile_image_url : data.user.profile_image_url
                  , from_user : data.user.screen_name
                });
                
                return models;
            }
        })
        
        C['twitter-image'] = C.QueryCollection.extend({          
            model : Models.TwitterImageModel
          , defaultUrl : 'http://otter.topsy.com/searchdate.json'
          , params : {
                q : ''
              , type : 'image'
              , perpage : 20
            }
          , parse : function( data ) {
                this.isRequesting(false);
                var response = data.response;
                var models = response.list;
                console.dir( data );
                var nextOffset = response['last_offset'];
                if( nextOffset !== response['offset'] ) {
                    this.nextUrl = this.defaultUrl + '?' + $.param( _.extend({ offset : nextOffset }, this.params) );                        
                } else {
                    this.nextUrl = undefined;
                }              
                return models;
            }
        });

        C['facebook'] = C.QueryCollection.extend({
          
            model : Models.FacebookModel
          , defaultUrl : 'https://graph.facebook.com/search'
          , params : {
                type : 'post'
              , limit : 20
              , q : ''
              , offset : 1
            }
          , parse : function( data ) {
                this.isRequesting(false);
                console.log('this.isRequesting() : ' + this.isRequesting());
                
                var models = data.data;
                if( data.paging && data.paging.next ) {
                    this.nextUrl = data.paging.next + '&callback=?';
                } else {
                    console.dir( data );
                }
                //this.nextUrl = data.paging.next;
                return models;
            }
        });
        
        return C;
    })();
    
    
    
    var Views = (function(){
        var V = {
            Item : { }
          , List : { }
        };
        
        V.ItemBaseView = Backbone.View.extend({
            tagName : 'li'
          , initialize : function( options ) {
                
            }
          , render : function() {
                this.$el.html(
                    this.template({
                        model : this.model.toJSON()
                    })
                );
                return this;
            }
        });        
        
        V.Item['twitter-search'] = V.ItemBaseView.extend({
            template : Templates['twitter-template']
          , className : 'clearfix tweet'
        });
        
        V.Item['twitter-user'] = V.Item['twitter-id'] = V.Item['twitter-search'];
        
        V.Item['twitter-image'] = V.ItemBaseView.extend({
            template : Templates['image-template']
          , className : 'image'
        });
        
        V.Item['facebook'] = V.ItemBaseView.extend({
            template : Templates['facebook-template']
          , className : 'clearfix tweet'
        });
        
        
        V.ListBaseView = Backbone.View.extend({
            prefix : 'search-content'
          , key : undefined
          , itemClass : undefined
          , initialize : function( options ) {
                this.setElement( '#' + this.prefix + '-' + this.key );
                if( !this.key || !this.$el) {
                    throw new Error('key :' + this.key + ' is invalid');
                }
                this.itemClass = V.Item[this.key];
                this.collection
                .on('reset', this.render, this )
                .on('add', this.addItem, this )
                .on('requeststart', this.showLoding, this )
                .on('requestend', this.hideLoding, this );
            }
          , showLoding : function() {
                this.$el.addClass('loding');
            }
          , hideLoding : function() {
                this.$el.removeClass('loding');
            }
          , createItem : function( model ) {
                var view = new this.itemClass({ model : model });
                this.$el.append( view.render().el );
            }
          , addItem : function( data ) {                                    
                if( _.isArray( data ) ) {
                    _.each( model, this.createItem, this );
                } else {
                    this.createItem( data );
                }
            }                  
          , render : function () {
                
                this.$el.html('');
                if( this.collection.length ) {                    
                    this.collection.each( this.createItem, this );
                } else {                    
                    // TODO make error msg nicely
                    this.$el.append('<p class=nohit>no hit for keyword : ' + this.collection._query + '</p>');
                }
                return this;                    
            }  
        });
        
        _.each( V.Item, function( item, key ) {
            V.List[key] = V.ListBaseView.extend({
                key : key
            });
        });        
        
        
        V.ContentView = Backbone.View.extend({
            el : '#search-content'
          , currentKey : undefined
          , currentView : undefined
          , initialize : function() {
                this.views = { };               
                this.changeView('twitter-search');
                var $el = this.$el
                  , el = this.el;
                // scrollHeight IE                                  
            }
          , events : {
              'scroll' : 'scrollHandler'
            }
          , scrollHandler : function(e) {
                if( this.$el.height() + this.$el.scrollTop() > this.el.scrollHeight - 10 ) {
                    this.loadNext();
                }
            }
          , loadNext : function() {
                var collection = this.currentView.collection;
                if( collection.hasNext() ) {
                    collection.queryNext();
                }
            }
          , doQuery : function( queryString ) {
                var collection = this.currentView.collection;
                collection.query( queryString );
            }
          , changeCategory : function( secoundKey ) {
                var firstKey = this.currentKey.split('-')[0];
                this.changeView( firstKey + '-' + secoundKey );
            }
          , changeView : function( key ) {                
                if( this.views[key] ) {
                    this.currentView = this.views[key];                  
                } else {                                                            
                    var targetView = V.List[key]
                      , targetCollection = Collections[key];

                    if( !targetView || !targetCollection) {
                        throw new Error( 'the key is invalid : ' + key );
                        return;
                    } 
                                       
                    this.currentView = this.views[key] = new targetView({
                        collection : new targetCollection()
                    });                    
                }                                
                this.currentKey = key;
                this.currentView.$el
                  .addClass('active')
                  .siblings('.active').removeClass('active');
                //   
                this.trigger('viewchange');
            }
        });
        
        
        
        return V;
    })();
    

    
    
    

    
    Views.AppView = Backbone.View.extend({
        el : $('#content')
      , initialize : function () {
            var content = this.contentView = new Views.ContentView();
            this.$searchInput = $('#search-input');
            
            $('#search-tab').tabs()
            .on('tabsselect', function(e, ui) {
                var key = [ ];
                // TODO write more nicely
                key.push(ui.panel.id.split('-')[2]);        
                var secoundKey = $( ui.panel ).children('span.selected').text().replace(/\s+/g, '');
                if( secoundKey !== '' ) {
                  key.push( secoundKey );
                }        
                content.changeView( key.join('-') );
            })
            .on('click', 'span.button', function(e) {
                console.log('span clicked');
                var category =  $( e.target )
                    .addClass('selected')
                    .siblings('.selected')
                    .removeClass('selected')
                    .end()
                    .text().replace(/\s+/g, '');
                console.log('category : ' + category);            
                content.changeCategory( category );
            });
            
            content.on('viewchange', this.viewChangeHandler, this );
            
        }        
      , events : {
            'keyup #search-input' : 'keyupHandler'
        }
      , keyupHandler : function( e ) {
            if( e.keyCode === 13 ) {
                this.viewChangeHandler();
            }
        }
      , viewChangeHandler : function() {
            var val = this.$searchInput.val();
            if( val !== '' ) {
                this.contentView.doQuery(val);
            }
        }
    });
    
    window.Collections = Collections;
    window.Views = Views;   
    var app = new Views.AppView();
    
})(jQuery, _, Backbone, JSONSelect);