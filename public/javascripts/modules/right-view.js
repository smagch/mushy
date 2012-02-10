define(['modules/util', 'modules/models'], function(U, Models) {
  
  var RV = {
    Item: {},
    List: {}
  },
  ItemBaseView = U.ItemBaseView,
  Collections = Models.Collection;          
  
  RV.Item['twitter-search'] = ItemBaseView.extend({
    template : 'twitter-template',
    className : 'clearfix tweet'
  });
  
  RV.Item['twitter-user'] = RV.Item['twitter-id'] = RV.Item['twitter-search'];
  
  RV.Item['twitter-image'] = ItemBaseView.extend({
    template : 'image-template',
    className : 'image'
  });
  
  RV.Item['facebook'] = ItemBaseView.extend({
    template : 'facebook-template',
    className : 'clearfix tweet'
  });
    
  RV.ListBaseView = Backbone.View.extend({
    prefix : 'search-content',
    key : undefined,
    itemClass : undefined,
    initialize : function( options ) {
      this.setElement( '#' + this.prefix + '-' + this.key );
      if( !this.key || !this.$el) {
          throw new Error('key :' + this.key + ' is invalid');
      }
      this.itemClass = RV.Item[this.key];
      this.collection
        .on('reset', this.render, this )
        .on('add', this.addItem, this )
        .on('remove', this.removeItem, this )
        .on('requeststart', this.showLoding, this )
        .on('requestend', this.hideLoding, this );
      },
    showLoding : function() {
      this.$el.addClass('loding');
    },
    hideLoding : function() {
      this.$el.removeClass('loding');
    },
    createItem : function( model ) {
      var view = new this.itemClass({ model : model });
      this.$el.append( view.render().el );
    },
    addItem : function( data ) {                                    
      if( _.isArray( data ) ) {
        _.each( model, this.createItem, this );
      } else {
        this.createItem( data );
      }
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
        this.collection.each( this.createItem, this );
      } else {                    
        // TODO make error msg nicely
        this.$el.append('<p class=nohit>no hit for keyword : ' + this.collection._query + '</p>');
      }
      return this;                    
    }  
  });
    
  _.each( RV.Item, function( item, key ) {
    RV.List[key] = RV.ListBaseView.extend({
      key : key
    });
  });        
  
  
  RV.ContentView = Backbone.View.extend({
    el : '#search-content',
    currentKey : undefined,
    currentView : undefined,
    views : { },
    currentCollection : function() {
      return this.currentView.collection;
    },
    initialize : function() {
      this.changeView('twitter-search');
      var $el = this.$el,
        el = this.el;
          // scrollHeight IE                                  
    },
    events : {
      'scroll' : 'scrollHandler'
    },
    scrollHandler : function(e) {
      if( this.$el.height() + this.$el.scrollTop() > this.el.scrollHeight - 10 ) {
        this.loadNext();
      }
    },
    loadNext : function() {
      var collection = this.currentCollection();
      if( collection.hasNext() ) {
        collection.queryNext();
      }
    },
    doQuery : function( queryString ) {
      var collection = this.currentCollection();
      collection.query( queryString );
    },
    changeCategory : function( secoundKey ) {
      var firstKey = this.currentKey.split('-')[0];
      this.changeView( firstKey + '-' + secoundKey );
    },
    changeView : function( key ) {                
      if( this.views[key] ) {
        this.currentView = this.views[key];                  
      } else {                                                            
        var targetView = RV.List[key],
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
  return RV;
});  
