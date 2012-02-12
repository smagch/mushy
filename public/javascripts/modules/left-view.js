define(['modules/util'], function(U) {  

  // alias


  var Items = { },
    M = { },
    C = { };
//  ItemBaseView = U.ItemBaseView;      
      
  M['MashUpModel'] = Backbone.Model.extend({                  
    //types : 'twitter facebook text'.split(/\s/g)
  });
    
  C['MashUpCollection'] = Backbone.Collection.extend({
      model: M.MashUpModel
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
  
  // var ItemBaseView = Backbone.View.extend({
  //   tagName: 'li',
  //   initialize : function( options ) {
  //     this.template = U.templates[this.template];
  //   },
  //   render: function() {
  //     this.$el.html(
  //       this.template({
  //         model : this.model.toJSON()
  //       })
  //     ).attr('data-model-cid', this.model.id);
  //     return this;
  //   }
  // });
  //   
  // Items['twitter'] = ItemBaseView.extend({
  //   template: 'twitter-quote-template',
  //   className: 'article-item clearfix twitter-quote'
  // });
  // 
  // Items['facebook'] = ItemBaseView.extend({
  //   //template: TODO
  //   templat: 'twitter-quote-template',
  //   className: 'article-item clearfix twitter-quote'
  // });
  // 
  // Items['text'] = ItemBaseView.extend({
  //   template: 'text-template',
  //   className: 'clearfix text article-item'
  // });
  
  
                  
  var ArticleView = Backbone.View.extend({
    el: '#article',
    template: 'quote-list-template',
    initialize : function() {
      this.template = U.templates[this.template];
      //this.$editor = this.$('#article-editor');
      this.$articleItems = this.$('#article-list');
      this.collection = new C['MashUpCollection']();
      this.collection
        .on('add', this.addItem, this )
        .on('reset', this.render, this )
        .on('change', this.change, this );
      
      this.$el
        .sortive({
          itemTag: 'li'                  
        })
        .on('indexchange', _.bind(this.setMarker, this))
        .on('itemmove', _.bind(this.moveItem, this))
        .on('sortfocusin', _.bind(this.focusIn, this))
        .on('sortfocusout', _.bind(this.focusOut, this));
        
      this.loadCache();
    },
    events : {
      //'click .add-text': 'moveInput',
      'focusin #article-editor': 'focusIn',
      'focusout #article-editor': 'focusOut',
      //'mouseenter .add-text': 'showAddText',
      'click .delete-button': 'removeItem'
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
    removeItem: function(e) {
      console.log('remove');
      var $target = $(e.target).parent(),
        cid = $target.attr('data-model-cid');
      
      var model = this.collection.getByCid(cid);
      this.collection.remove(model, {
        silent: true
      });
      $target.remove();
      this.updateCache();
    },    
    change: function(model, options) {
      console.log('change');
      console.dir( model );
      console.dir( options );
      this.updateCache();
    },
    updateCache: function() {
      var cache = this.collection.toJSON();
      // TODO JSON poryfill      
      localStorage.setItem('mr', JSON.stringify(cache));      
    },
    loadCache: function() {
      //             
      var cache = localStorage.getItem('mr');
      if(cache) {
        var obj = JSON.parse(cache);
        console.log('cache');
        console.dir( obj );
        this.collection.reset(obj);
      }
    },
    moveInput: function(e) {
      var offset = $(e.target).offset();
      //this.$editor.offset(offset);                
    },
    setMarker: function(e, data) {
      console.log('setMarker');
    },
    moveItem: function(e, data) {
      console.log('moveItem');
    },
    focusIn: function(e) {
      console.log('focus in');        
    },
    focusOut: function(e) {
      console.log('focus out');
      // var index;
      //                 var model = new M['MashUpModel']({
      //                   text : 'hoge'
      //                 });
      //                 
      //                 this.collection.add(model);
    },
    addItem: function(model) {
      console.log('add item article');
      // model.type
      // var type = model.get('type');
      // var targetView = Items[type];
      // if( !targetView ) {
      //     throw new Error('model type : ' + type + ' is invalid');
      // }
      // var view = new targetView({ model : model });
      // this.$articleItems.append(view.render().el);
      // this.updateCache();
      console.dir( model );
      this.renderByModels([model.toJSON()]);
    },
    render: function() {
      this.renderByModels(this.collection.toJSON());
    },
    renderByModels: function(models) {
      console.log('render article');
      console.dir( models );
      var element = this.template({models: models});
      console.log('element : ' + element);      
      this.$articleItems.append(element);
      this.updateCache();
    }
  });
  
  var articleView;
  return {
    getInstance: function() {
      if(!articleView) {
        articleView = new ArticleView();
      }
      return articleView;
    }
  };
});