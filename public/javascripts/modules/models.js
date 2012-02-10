define(function() {
  var Models = {
    Model: {},
    Collection: {}
  },
  // alias
  M = Models.Model,
  C = Models.Collection;
  
  M.TwitterModel = Backbone.Model.extend({
    type: 'twitter',
    defaults: {
      type: 'twitter'
    }
  });
          
  M.TwitterImageModel = Backbone.Model.extend({
    type : 'image',
    defaults: {
      type: 'image'
    }
  });
  
  M.FacebookModel = Backbone.Model.extend({
    type : 'facebook',
    defaults: {
      type: 'facebook'
    }
  });

  
  C.QueryCollection = Backbone.Collection.extend({           
    url : function() {
      if( this.isPaging ) {
        return this.nextUrl + '&callback=?';
      }
      return this.defaultUrl + '?' + $.param(this.params) + '&callback=?';
    },
    params : { },
    queryKey : 'q',
    _queryString : function(str) {
      if( str === undefined ) {
        return this.params[this.queryKey];
      }
      this.params[this.queryKey] = str;
    },          
    query : function(queryString) {
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
    },         
    queryNext : function() {
     if( this.nextUrl && !this.isRequesting() ) {                     
       this.isPaging = true;
       this.isRequesting(true);
       this.fetch({
         add : true
       });
      }
    },
    parse: function(data) {
      this.isRequesting(false);
      return this._parse(data);
    },
    _parse: function() {},
    isRequesting : function( value ) {
      if( value === undefined ) {
        return this._isRequesting;
      }
      this._isRequesting = value;
      if( value ) {
        this.trigger('requeststart');
      } else {
        this.trigger('requestend');
      }                                
    },
    nextUrl : undefined,
    hasNext : function() {
      return !!this.nextUrl;                        
    } 
  });
  
  C['twitter-search'] = C.QueryCollection.extend({          
    model : M.TwitterModel,
    defaultUrl : "http://search.twitter.com/search.json",
    params : {
      q : ''
    },
    _parse : function( data ) {
      //this.isRequesting(false);
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
    model : M.TwitterModel,
    initialize : function() {
      this.on('reset', function() {
        console.log('user reset');
      }).on('add', function() {
        console.log('user add');
      });
    },
    defaultUrl : 'https://api.twitter.com/1/statuses/user_timeline.json',
    params : {
      include_entities : true,
      include_rts : true,
      screen_name : ''
    },
    queryKey : 'screen_name',
    _parse : function( data ) {
      //this.isRequesting(false);
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
          text : model.text,
          profile_image_url : model.user.profile_image_url,
          from_user : model.user.screen_name
        });
      });
      
      var lastId = _.last( data )['id_str'];
      
      this.nextUrl = this.defaultUrl + '?' + $.param( _.extend({ max_id : lastId }, this.params) );
                      
      return models;
    },
    timeoutId : undefined,
    fetch : function( options ) {
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
    model : M.TwitterModel,
    defaultUrl : 'https://api.twitter.com/1/statuses/show.json',
    params : {
      id : '',
      include_entity : true
    },
    queryKey : 'id',
    _parse : function( data ) {
      //this.isRequesting(false);
      var models = [ ];
      models.push({
          text : data.text
        , profile_image_url : data.user.profile_image_url
        , from_user : data.user.screen_name
      });
      
      return models;
    }
  });
  
  C['twitter-image'] = C.QueryCollection.extend({          
    model : M.TwitterImageModel,
    defaultUrl : 'http://otter.topsy.com/searchdate.json',
    params : {
      q : '',
      type : 'image',
      perpage : 20
    },
    _parse : function( data ) {
      //this.isRequesting(false);
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
    model : M.FacebookModel,
    defaultUrl : 'https://graph.facebook.com/search',
    params : {
      type : 'post',
      limit : 20,
      q : '',
      offset : 1
    },
    parse : function( data ) {
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
  
  return Models;
});