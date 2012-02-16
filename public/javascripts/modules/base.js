define(['modules/left-view', 'modules/right-view', 'modules/util'], function(LV, RV, U){
  // base view
  
  var RightColumn = Backbone.View.extend({
    el : '#right-column',
    currentCollection : function() {
      return this.rightView.currentCollection();
    },
    initialize : function () {
      this.rightView = RV.getInstance();
    }
  });
  
  var LeftColumn = Backbone.View.extend({
    el : '#article',
    initialize : function() {
      this.articleView = LV.getInstance();
    },
    events : {
    
    },
    addModel : function( model, index ) {
      this.articleView.collection.add( model, { at: index } );
    }
  });
    
  var AppView = Backbone.View.extend({
    el: '#content',
    initialize: function() {
      this.leftColumn = new LeftColumn();
      this.rightColumn = new RightColumn();
      var self = this;
      $('#search-content')
        .sortive({
          item : 'li',
          selfSort : false
        })
        .on('itemsend', _.bind( this.sendItem, this) );
    },
    events: {
    
    },
    sendItem: function( e, data ) {
      var currentCollection = this.rightColumn.currentCollection();
      //var model = currentCollection.getByCid(id);
      var model = currentCollection.at(data.index.from);
      // TODO index
      this.leftColumn.addModel(model.toJSON(), data.index.to );
      currentCollection.remove( model);
    }
  });
  
  return {
    start: function() {
      U.precompileTemplates();
      return new AppView();
    }
  };
});