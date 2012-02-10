define(['modules/util'], function(U) {  
  var LV = {
    Models: {},
    Collections: {},    
    Item: {}    
  },
  // alias
  M = LV.Models,
  C = LV.Collections,
  Item = LV.Item,
  ItemBaseView = U.ItemBaseView;      
      
  M['MashUpModel'] = Backbone.Model.extend({                  
    //types : 'twitter facebook text'.split(/\s/g)
  });
    
  C['MashUpCollection'] = Backbone.Collection.extend({
      model : M.MashUpModel
    // , initialize : function(options) {
    //       this.on('add', this.addHandler, this );
    //   }
    // , addHandler : function(models) {
    //       if( _.isArray(model) ) {
    //           
    //       } else {
    //           
    //       }
    //   }
    // , checkIndex : function(model) {
    //       
    //   }     
  });
    
  Item['twitter'] = ItemBaseView.extend({
    template : 'twitter-quote-template',
    className : 'clearfix twitter-quote'
  });
  
  Item['facebook'] = Backbone.View.extend({
    
  });
  
  Item['text'] = ItemBaseView.extend({
    template : 'text-template',
    className : 'clearfix text'
  });
                  
  LV.ArticleView = Backbone.View.extend({
    el : '#article',
    initialize : function() {
      this.$editor = this.$('#article-editor');
      this.$articleItems = this.$('#article-list');
      this.collection = new C['MashUpCollection']();
      this.collection
        .on('add', this.addItem, this )
        .on('reset', this.render, this )
        .on('change', this.change, this );                                
      
      this.$el
        .sortive({
          itemTag : 'li'                  
        })
        .on('indexchange', _.bind(this.setMarker, this))
        .on('itemmove', _.bind(this.moveItem, this))
        .on('sortfocusin', _.bind(this.focusIn, this))
        .on('sortfocusout', _.bind(this.focusOut, this));              
    },
    events : {
      'click .add-text': 'moveInput',
      'focusin #article-editor': 'focusIn',
      'focusout #article-editor': 'focusOut',
      'mouseenter .add-text': 'showAddText'
    },
    showAddText: function(e) {
      // var $target = $(e.target);
      //             var timeoutId = setTimeout(function() {
      //               $target.show();
      //             }, 1000);
      //             
      //             $(e.target).one('mouseleave', function(e) {
      //               clearTimeout(timeoutId);
      //               $target.hide();
      //             });
    },
    change: function(e) {
      console.log('change');
      console.dir( e );
    },
    moveInput: function(e) {
      var offset = $(e.target).offset();
      this.$editor.offset(offset);                
    },
    setMarker : function(e, data) {
      console.log('setMarker');
    },
    moveItem : function(e, data) {
      console.log('moveItem');
    },
    focusIn : function(e) {
      console.log('focus in');        
    },
    focusOut : function(e) {
      console.log('focus out');
      // var index;
      //                 var model = new M['MashUpModel']({
      //                   text : 'hoge'
      //                 });
      //                 
      //                 this.collection.add(model);
    },
    addItem : function( model ) {
      console.log('add item article');
      // model.type
      var type = model.get('type');
      var targetView = Item[type];
      if( !targetView ) {
          throw new Error('model type : ' + type + ' is invalid');
      }
      var view = new targetView({ model : model });
      this.$articleItems.append(view.render().el);
    },
    render : function() {
      console.log('render article');
    }
  });
  
  return LV;
});