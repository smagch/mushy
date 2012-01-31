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
  
    // TODO - add loding gif
    // TODO - add paging
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
            // doQuery : function( queryString ) {
            //        if( queryString && 
            //            this._query !== queryString && 
            //            queryString.length > 0 &&
            //            queryString.length < 50 ) {
            //            this._query = queryString
            //            this.fetch();
            //        }            
            //    }
            query : function(queryString) {
                if(!queryString) {
                    return this._query;
                }
                
                if( this._query !== queryString ) {
                    this._query = queryString;
                    this.fetch();
                }                                
                
                
            }
          , nextUrl : undefined
          , hasNext : function() {
                return !!this.nextUrl;                        
            }      
          , next : function() {
                if( this.nextUrl ) {
                  this.url = nextUrl;
                }
            }
        });
        
        C['twitter-search'] = C.QueryCollection.extend({          
            model : Models.TwitterModel
          , url : function () {
                return "http://search.twitter.com/search.json?q=" + this._query + "&callback=?"
            }
          , parse : function( data ) { 
               
                var models = data.results;
                this.nextUrl = data.next_page;
                return models;
            }
        });
        
        C['twitter-user'] = C.QueryCollection.extend({            
            model : Models.TwitterModel
          , url : function() {
                return 'https://api.twitter.com/1/statuses/user_timeline.json?' + 
                  'include_entities=true&include_rts=true&screen_name=' + this._query +
                  '&callback=?'                 
            }
          , parse : function( data ) {                
                var models = [ ];
               
                
                _.each(data, function( model ) {
                    models.push({
                        text : model.text
                      , profile_image_url : model.user.profile_image_url
                      , from_user : model.user.screen_name
                    });
                });
                
                return models;
            }
        });
        
        C['twitter-image'] = C.QueryCollection.extend({
          
            model : Models.TwitterImageModel
          , url : function() {
                return 'http://otter.topsy.com/searchdate.json?q=' + this._query + '&geocode=&type=image&perpage=16&callback=?';
            }
          , parse : function( data ) {                
                var models = data.response.list;
                // TODO nextUrl
            
                return models;
            }
        });

        C['facebook'] = C.QueryCollection.extend({
          
            model : Models.FacebookModel
          , url : function() {
                return 'https://graph.facebook.com/search?type=post&limit=20&q=' + this._query + '&offset=10&callback=?';            
            }
          , parse : function( data ) {
                var models = data.data;                
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
        
        V.Item['twitter-user'] = V.Item['twitter-search'];
        
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
                this.collection.on('reset', this.render, this );
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
                
                if( this.collection.length ) {
                    this.collection.each( this.createItem, this );
                } else {
                    //this.append
                    // TODO error
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
    
       
    var app = new Views.AppView();
    
})(jQuery, _, Backbone, JSONSelect);