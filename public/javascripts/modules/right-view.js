define(['modules/models', 'modules/util'], function(Models, Util) {
  
  
  var Lists = {},
    Collections = Models.Collections;
    //Items = {},    
  //ItemBaseView = U.ItemBaseView,
  
  
  // RV.Items['twitter-search'] = ItemBaseView.extend({
  //   template : 'twitter-template',
  //   className : 'clearfix tweet'
  // });
  // 
  // RV.Items['twitter-user'] = RV.Items['twitter-id'] = RV.Items['twitter-search'];
  // 
  // RV.Items['twitter-image'] = ItemBaseView.extend({
  //   template : 'image-template',
  //   className : 'image'
  // });
  // 
  // RV.Items['facebook'] = ItemBaseView.extend({
  //   template : 'facebook-template',
  //   className : 'clearfix tweet'
  // });
  

    
  var ListBaseView = Backbone.View.extend({
    prefix : 'search-content',
    key : undefined,
    //itemClass : undefined,
    initialize : function( options ) {
      this.template = Util.templates[this.template];
      this.setElement( '#' + this.prefix + '-' + this.key );
      if( !this.key || !this.$el) {
          throw new Error('key :' + this.key + ' is invalid');
      }      
      this.collection
        .on('reset', this.render, this )
        .on('add', this.addItem, this )
        .on('remove', this.removeItem, this )
        .on('requeststart', this.showLoding, this )
        .on('requestend', this.hideLoding, this );
        
      //this.itemClass = Items[this.key];
    },
    showLoding : function() {
      this.$el.addClass('loding');
    },
    hideLoding : function() {
      this.$el.removeClass('loding');
    },
    // createItem : function( model ) {
    //   var view = new this.itemClass({ model : model });
    //   this.$el.append( view.render().el );
    // },
    addItem : function( data ) {
      var models = data.toJSON();
      _.isArray(models) || (models = [models]);      
      this.$el.append(
        this.template({
          models: models
        })
      );
      // if( _.isArray( data ) ) {
      //   _.each( model, this.createItem, this );
      // } else {
      //   this.createItem( data );
      // }
    },
    getChildAt : function(index) {
      return this.$el.children(':nth-child('+ (index+1) + ')');
    },
    removeItem : function( model, collection ) {
      console.log('remove');
      //var id = model.cid;
      //this.$('li[id='+ id + ']').remove();
      //var index = collection.indexOf(model);
      //console.log('index : ' + index);
      // TODO how to smartly remove item
      this.render();                
      //this.getChildAt(index).remove();
          
    },                  
    render : function () {      
      this.$el.empty();            
      if( this.collection.length ) {                    
        //this.collection.each( this.createItem, this );
        this.$el.html(
          this.template({
            models: this.collection.toJSON()
          })
        );
      } else {                    
        // TODO make error msg nicely
        this.$el.append('<p class=nohit>no hit for keyword : ' + this.collection._query + '</p>');
      }
      return this;                    
    }  
  });
  
  // _.each( RV.Items, function( item, key ) {    
  //   RV.Lists[key] = RV.ListBaseView.extend({
  //     key : key
  //   });    
  // });
  
  Lists['twitter-search'] = ListBaseView.extend({
    template: 'twitter-list-template',
    key: 'twitter-search',
    className: 'clearfix'
  });
  
  Lists['twitter-user'] =  ListBaseView.extend({
    template: 'twitter-list-template',
    key: 'twitter-user',
    className: 'clearfix'
  });
  
  Lists['twitter-id'] =  ListBaseView.extend({
    template: 'twitter-list-template',
    key: 'twitter-id',
    className: 'clearfix'
  });
  
  Lists['twitter-image'] = ListBaseView.extend({
    template: 'image-list-template',
    className: 'clearfix',
    key: 'twitter-image'
  });
  
  Lists['facebook'] = ListBaseView.extend({
    template: 'facebook-list-template',
    key: 'facebook',
    className: 'clearfix'
  });
  // 
  // RV.Items['twitter-user'] = RV.Items['twitter-id'] = RV.Items['twitter-search'];
  // 
  // RV.Items['twitter-image'] = ItemBaseView.extend({
  //   template : 'image-template',
  //   className : 'image'
  // });
  // 
  // RV.Items['facebook'] = ItemBaseView.extend({
  //   template : 'facebook-template',
  //   className : 'clearfix tweet'
  // });
  
  // related view 
  var RelatedView = Backbone.View.extend({
    template: 'twitter-list-template',
    className: 'clearfix',
    el: '#search-content-related',
    initialize: function() {
      this.template = Util.templates[this.template];
      this.collection = new Collections['twitter-related']();
      this.collection
        .on('reset', this.resetView, this )
        .on('add', this.render, this );
        //.on('requeststart', this.showLoding, this )
        //.on('requestend', this.hideLoding, this );
    },
    show: function(id) {
      var model;
      this.$el.addClass('active');      
      if(model = this.collection.get(id)) {
        this.render(model);
      } else {
        this.collection.queryById(id);
      }      
    },
    hide: function() {
      console.log('hide');
      this.$el.removeClass('active');
    },
    resetView: function(context, options) {
      var model = this.collection.get(options.id);
      this.render(model);
    },
    // render currentCollection
    render: function(model) {      
      this.$el.html(
        this.template({
          models: model.get('results')
        })
      );
      return this;      
    }
  });  
       
  
  var ContentView = Backbone.View.extend({
    el: '#search-content',
    currentKey: undefined,
    currentView: undefined,
    currentCollection: function() {
      return this.currentView.collection;
    },
    // currentModelId: function() {
    //   var collection = this.currentCollection();
    //   //collection.
    // },
    views: { },
    initialize: function() {
      //this.callbacks = $.Callbacks('once');
      this.changeView('twitter-search');      
      //this.$related = this.$('search-content-related');
      this.relatedView = new RelatedView();
      // scrollHeight IE                                  
    },
    events: {
      'scroll': 'scrollHandler',
      'click li': 'loadRelated',
    },
    scrollHandler: function(e) {
      if( this.$el.height() + this.$el.scrollTop() > this.el.scrollHeight - 10 ) {
        this.loadNext();
      }
    },
    loadRelated: function(e) {    
      // TODO      
      // if(this.currentView === this.views['twitter-user']) {
      //   //this.callbacks.fire();
      //   console.log('clicked load related');
      //   var $target = $(e.target),
      //     id = $target.addClass('selected').attr('data-model-id-str');
      //   
      //   this.relatedView.show(id);      
      //   e.stopPropagation();
      //   //$(document).one('click', _.bind(this.relatedView.hide, this.relatedView));
      //   var self = this;
      //   this.callbacks
      //     .add(_.bind(this.relatedView.hide, this.relatedView))
      //     .add($target.removeClass('selected'));
        
        //$(document).one('click', this.callbacks.fire);
        //$(document).one('click', function(e) {
          //self.relatedView.hide();
          //$target.removeClass('selected');
        //});
      //}      
    },
    loadNext: function() {
      var collection = this.currentCollection();
      if( collection.hasNext() ) {
        collection.queryNext();
      }
    },
    doQuery: function( queryString ) {
      var collection = this.currentCollection();
      collection.query( queryString );
    },
    changeCategory: function( secoundKey ) {
      var firstKey = this.currentKey.split('-')[0];
      this.changeView( firstKey + '-' + secoundKey );
    },
    changeView: function( key ) {                
      if( this.views[key] ) {
        this.currentView = this.views[key];                  
      } else {                                                            
        var targetView = Lists[key],
          targetCollection = Collections[key];

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
        .siblings('.active')
        .removeClass('active');
      
      this.trigger('viewchange');
    }
  });
  
  // public methods
  var _contentView;
  return {
    getInstance: function() {
      if(!_contentView) {
        _contentView = new ContentView();
      } 
      return _contentView;
    }
  };
});  
