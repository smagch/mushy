define(function() {
  var Models = {
    Models: {},
    Collections: {}
  },
  // alias
  M = Models.Models,
  C = Models.Collections;
  
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
    params : null,
    queryKey : 'q',
    toJSONWithCid: function() {
      return this.map(function(model){
        return (model.toJSON().cid = model.cid);
      });
    },
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
    parse: function(response) {
      this.isRequesting(false);
      return this._parse(response);
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
    _parse : function( response ) {
      //var models = response.results;
      if(response.next_page) {
        this.nextUrl = 'http://search.twitter.com/search.json' + response.next_page ;
      } else {
        this.nextUrl = undefined;
      }
      // else if( response.refresh_url ){
      //         console.log('refresh : ' + this.nextUrl );
      //         console.dir( response );
      //         this.nextUrl = undefined;
      //       } else {
      //         this.nextUrl = undefined;
      //       }
      
      return _.map(response.results, function(model) {
        return {
          id_str: model.id_str,
          from_user: model.from_user,
          from_user_name: model.from_user_name,
          text: model.text,
          profile_image_url: model.profile_image_url
        };
      });
    }
  });
  
  C['twitter-user'] = C.QueryCollection.extend({
    model : M.TwitterModel,
    initialize : function() {
      // this.on('reset', function() {
      //
      // }).on('add', function() {
      //
      // });
    },
    defaultUrl : 'https://api.twitter.com/1/statuses/user_timeline.json',
    params : {
      include_entities : true,
      include_rts : true,
      screen_name : ''
    },
    queryKey : 'screen_name',
    _parse : function( response ) {
      //this.isRequesting(false);
      if( this.timeoutId ) {
        clearTimeout(this.timeoutId);
        this.timeoutId = undefined;
      }
      
      // if Paging, remove first tweet
      if( this.isPaging ) {
        response.shift();
      }
      
      var lastId = _.last( response )['id_str'];
      this.nextUrl = this.defaultUrl + '?' + $.param( _.extend({ max_id : lastId }, this.params) );
      
      return _.map(response, function(model) {
        return {
          id_str: model.id_str,
          from_user: model.user.from_user,
          from_user_name: model.user.from_user_name,
          text: model.text,
          profile_image_url: model.user.profile_image_url
        };
      });
    },
    timeoutId : undefined,
    fetch : function( options ) {
      // 4 sec for timeout
      this.timeoutId = setTimeout( _.bind( function() {

        this.timeoutId = undefined;
        this.reset([]);
      }, this ) , 4000);
      Backbone.Collection.prototype.fetch.call( this, options );
    }
  });
  
  // related collection is differenct from other collections
  // reset models when called clear method
  // can handle multiple request
  C['twitter-related'] = Backbone.Collection.extend({
    model: M.TwitterModel,
    // offical page use https://api.twitter.com/1/related_results/show/:id?enclude_entities=1
    // but passing id by param also work
    defaultUrl: 'https://api.twitter.com/1/related_results/show.json',
    params: {
      id: '',
      include_entities: 1
    },
    initialize: function() {
      this._isCleared = false;
    },
    clear: function() {
      this._isCleared = true;
    },
    url: function() {
      return this.defaultUrl + '?' + $.param(this.params) + '&callback=?';
    },
    queryById : function(id) {
      if(!id) {
        return;
      }
      this.params.id = '' + id;
      var options = { id: id };
      this._isCleared || (options.add = true);
      return this.fetch(options);
    },
    // adding callback to deffered object from fetch call may be better approach
    // rather than this crappy override
    add: function(models, options) {
      var model = {
        id: options.id,
        results: models
      };
      return Backbone.Collection.prototype.add.call(this, model, options);
    },
    parse: function(response, xhr) {

      var data = response[0];
      if(data) {
        var ret =  _.map(data.results, function(model) {
          var value = model.value;
          return {
            id_str: value.id_str,
            from_user: value.screen_name,
            from_user_name: value.name,
            text: value.text,
            profile_image_url: value.profile_image_url
          };
        });
        return ret;
      }
      return [];
    }
  });
  
  C['twitter-id'] = C.QueryCollection.extend({
    model: M.TwitterModel,
    defaultUrl: 'https://api.twitter.com/1/statuses/show.json',
    params: {
      id: '',
      include_entities: true
    },
    queryKey : 'id',
    _parse : function( response ) {
      return  [{
        text : response.text,
        profile_image_url : response.user.profile_image_url,
        from_user : response.user.screen_name
      }];
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
    _parse : function( response ) {
      var res = response.response,
        models = res.list;
      
      var nextOffset = res['last_offset'];
      if( nextOffset !== res['offset'] ) {
        this.nextUrl = this.defaultUrl + '?' + $.param( _.extend({ offset : nextOffset }, this.params) );
      } else {
        this.nextUrl = undefined;
      }
      return _.map(res.list, function(model) {
        // TODO
        return {};
      });
    }
  });
  // status video sort should be done by view.
  C['facebook'] = C.QueryCollection.extend({
    model: M.FacebookModel,
    defaultUrl: 'https://graph.facebook.com/search',
    params: {
      type : 'post',
      limit : 20,
      q : '',
      offset : 1
    },
    _parse: function( response ) {
      if( response.paging && response.paging.next ) {
        this.nextUrl = response.paging.next;
      }
      
      var models = [ ],
        typeMap = {
          status: 1,
          video: 1
        };
      
      _.each(response.data, function(model) {
        if(typeMap[model.type]) {
          var ret = {
            id_str: model.id,
            text: model.message,
            from_user: model.from.name,
            from_id: model.from.id,
            profile_image_url: 'https://graph.facebook.com/'+ model.from.id +'/picture',
            date: model.created_time,
            _type: model.type
          };
          
          if(model.type === 'video') {
            ret.link = model.link;
            ret.name = model.name;
            ret.description = model.description;
          }
          models.push(ret);
        }
      });
      
      return models;
    }
  });
  
  return Models;
});