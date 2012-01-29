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
      
    var noop = function() {};
    // templates
    var Templates = (function(){
      var Templates = { };
      $("script[type='text/template']").each(function() {
          var $this = $(this);
          Templates[$this.id].template($this.html());
      });
      return Templates;
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
            doQuery : function( queryString ) {
                if( queryString && 
                    this._query !== queryString && 
                    queryString.length > 0 &&
                    queryString.length < 50 ) {
                    this._query = queryString.replace(/\s+/g, '+');
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
        
        C.TwitterCollection = C.QueryCollection.extend({
          
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
        
        C.TweetImageCollection = C.QueryCollection.extend({
          
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

        C.FacebookModel = C.QueryCollection.extend({
          
            model : Models.FacebookModel
          , url : function() {
                return 'https://graph.facebook.com/search?type=post&limit=20&q=' + this._query + '&offset=10&callback=?';            
            }
          , parse : function( data ) {
                var models = data.data;
                this.nextUrl = data.paging.next;
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
            initialize : function( options ) {
                
            }
          , render : function() {
                this.el.html(
                    this.template({
                        model : this.model.toJSON()
                    })
                );
            }
        });
        
        V.ListBaseView = Backbone.View.extend({
            prefix : '#search-content'
          , key : undefined
          , itemClass : undefined
          , initialize : function( options ) {
                this.el = $( this.prefix + this.key );
                if( !this.key || !this.el ) {
                    throw new Error('key :' + this.key + ' is invalid');
                }
                
                this.collection.bind( 'add', addItem, this );
                //this.collection.bind( 'change')
            }
          , addItem : function( data ) {
                function createItem( model ) {
                    var view = new this.itemClass({ model : model });
                    this.el.append( view.render().el );
                }                

                if( _.isArray( data ) ) {
                    _.each( model, this.createItem, this );
                } else {
                    this.createItem( data );
                }
            }
          // , render : function () {      
          //         this.collection.each(function( model ) {
          //             
          //         });
          //     }  
        });
        
        V.Item.TwitterItemView = V.ItemBaseView.extend({
            template : Templates['twitter-template']          
        });
        
        V.Item.TwitterImageItemView = V.ItemBaseView.extend({
            template : Templates['image-template']
        });
        
        V.Item.FacebookItemView = V.ItemBaseView.extend({
            template : Templates['facebook']
        });
        
        V.List.TwitterView = V.ListBaseView.extend({
            key : 'twitter-timeline'
          , itemClass : V.Item.TwitterItemView  
        });                
                
        V.List.TwitterImageView = V.ListBaseView.extend({
            key : 'twitter-image'
          , itemClass : V.Item.TwitterImageItemView
        });       
         
        V.List.FacebookView = V.ListBaseView.extend({
            key : 'facebook'     
          , itemClass : V.Item.FacebookItemView
        });
        
        
        Views.ContentView = Backbone.View.extend({
            id : '#search-content'
          , initialize : function() {
                this.el = $(this.id);                
                this.views = { };               
                this.changeView('twitter-timeline');
            }
          , changeView : function( key ) {                
                if( this.views[key] ) {
                    this.currentView = this.views[key];                  
                } else {
                    var targetClass = _.find( V.List, function( view, viewKey ) {
                        return key === viewKey;
                    });

                    if( !targetClass ) {
                        throw new Error('there is no such a view with key : ' + key );
                        return;
                    }

                    this.currentView = this.views[key] = new targetClass();
                }                                
                
                this.currentView.el
                  .addClass('active')
                  .siblings('.active').removeClass('active');
            }
        });
        
        
        
        return V;
    })();
    

    
    
    // var TabTracker = (function(){
    //     var _key = 'twitter-timeline'
    //       , categoryTempl = _.template('#search-<%= firstkey %>-categories > span.selected')  
    //       , templates = [
    //           _.template( '#search-<%= firstKey %>-categories' )
    //         , _.template( '#search-<%= key %>-content' )
    //       ];
    //       
    //     function update () {
    //         var options = {
    //             key : _key
    //           , firstKey : _key.split('-')[0]
    //         }
    //         _.each( templates, function( template ) {
    //             var selector = template( options );
    //             console.log('selector : ' + selector);
    //             $( selector ).addClass( 'active' )
    //                 .siblings( '.active' ).removeClass( 'active' );
    //         });
    //     }                                                                          
    //     return {
    //         setKey : function( key ) {
    //             var keys = [ key ];
    //             var categorySelector = categoryTempl({ firstkey : key });
    //             var category = $(categorySelector).text().replace( /\s+/g, '' );
    //             ( category !== '' ) && ( keys.push( category ) );
    //             
    //             _key = keys.join('-');
    //             console.dir(keys);
    //             update();
    //         }
    //       , setCategory : function( category ) {
    //             var keys = _key.split('-');
    //             keys[1] = category;
    //             _key = keys.join('-');
    //             update();
    //         }
    //       , getKey : function() {                
    //             return _key;
    //         }
    //     }        
    // })();
    
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
    
    Views.AppView = Backbone.View.extend({
        el : $('#content')
      , initialize : function () {            
            
            $('#search-categories').on('click', 'span', _.bind( this.categoryChange, this ) );
            $('#facebook-list').css('display', 'block');            
        }        
      // , currentModel : function() {
      //        var key = TabTracker.getKey();
      //        return this.models[key];
      //    }
      //  , currentView : function() {
      //        return this.views[ this.currentKey ];
      //    }
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