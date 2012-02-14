define(['modules/models', 'modules/util'], function(Models, Util) {
  
  
  var Lists = {},
    Collections = Models.Collections;
    
  var ListBaseView = Backbone.View.extend({
    prefix : 'search-content',
    key : undefined,
    className: 'clearfix',
    //itemClass : undefined,
    initialize : function( options ) {
      this.template = Util.templates[this.template];
      var id = '#' + this.prefix + '-' + this.key;
      this.setElement( id );
      if( !this.key || !this.$el) {
          throw new Error('key :' + this.key + ' is invalid');
      }
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
    addItem : function( data ) {
      var models = data.toJSON();
      if(!_.isArray(models)) {
        models = [models];
      }
      this.$el.append(
        this.template({
          models: models
        })
      );
    },
    removeItem : function( model, collection ) {
      // TODO remove item smarter way
      this.render();
    },
    render : function () {
      this.$el.empty();
      if( this.collection.length ) {
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
  
  Lists['twitter-search'] = ListBaseView.extend({
    template: 'twitter-search-template',
    key: 'twitter-search',
    className: 'clearfix'
  });
  
  Lists['twitter-user'] =  ListBaseView.extend({
    template: 'twitter-search-template',
    key: 'twitter-user'
  });
  
  Lists['twitter-id'] =  ListBaseView.extend({
    template: 'twitter-search-template',
    key: 'twitter-id'
  });
  
  Lists['twitter-image'] = ListBaseView.extend({
    template: 'image-search-template',
    key: 'twitter-image'
  });
  
  Lists['facebook'] = ListBaseView.extend({
    template: 'facebook-search-template',
    key: 'facebook'
  });
  
  Lists['youtube'] = ListBaseView.extend({
    template: 'youtube-search-template',
    key: 'youtube-search'
  });
  
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
      this.$el.addClass('active');
      var model = this.collection.get(id);
      if(model) {
        this.render(model);
      } else {
        this.collection.queryById(id);
      }
    },
    hide: function() {
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
      'click li': 'loadRelated'
    },
    scrollHandler: function(e) {
      if( this.$el.height() + this.$el.scrollTop() > this.el.scrollHeight - 10 ) {
        this.loadNext();
      }
    },
    loadRelated: function(e) {
      // TODO where to put related content
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
        var TargetView = Lists[key],
          TargetCollection = Collections[key];

        if( !TargetView || !TargetCollection) {
          throw new Error( 'the key is invalid : ' + key );
        }
        
        this.currentView = this.views[key] = new TargetView({
          collection : new TargetCollection()
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
