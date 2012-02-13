define(['modules/util'], function(U) {  

  // alias


  var Items = { },
    M = { },
    C = { };
//  ItemBaseView = U.ItemBaseView;      
      
  M['MashUpModel'] = Backbone.Model.extend({                  
    //types : 'twitter facebook text'.split(/\s/g)
    toJSONWithCid: function() {
      return ( this.toJSON().cid = this.cid );
    }
  });
    
  C['MashUpCollection'] = Backbone.Collection.extend({
      model: M.MashUpModel,
      toJSONWithCid: function() {
        return this.map(function(model){
          var obj = model.toJSON();
          obj.cid = model.cid;
          return obj;
        });
      },
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
      this.$editor = this.$('#article-editor');
      this.$editor
        .autosize()
        .hide();
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
        //.on('sortfocusin', _.bind(this.focusIn, this))
        //.on('sortfocusout', _.bind(this.focusOut, this));
        
      this.loadCache();
    },
    events : {
      //'click .add-text': 'moveInput',
      //'focusin #article-editor': 'focusIn',
      'focusout #article-editor': 'leaveTextEdit',
      //'mouseenter .add-text': 'showAddText',
      'click #article-editor': 'clickEditor',
      'click .delete-button': 'deleteClicked',
      'click .add-button': 'showMenu',
      'click .article-item-text': 'editText'
    },
    leaveTextEdit: function(e) {
      var val = this.$editor.val(),
        data = this.$editor.data('target');
      if(!data) {
        throw new Error('no data');
      }
      
      var model = data.model,
        index = data.index;
      // if editing text, set text

      if(model) {
        model.set('text', val);
        data.$target.show();
      } else if(val.replace(/\s+/g).length){
        model = new M['MashUpModel']({
          type: 'text',
          text: val
        });
        this.collection.add( model, {
          at: index
        });
      }
      this.$editor
        .removeData('target')
        .val('')
        .hide();
    },
    editText: function(e) {
      var $target = $(e.target).parents('li'),        
        cid = $target.attr('data-model-cid'),
        model = this.collection.getByCid(cid);
      
      $target.hide();
      this.$editor              
        .data('target', {
          model: model,
          $target: $target
        })
        .val(model.get('text'))
        .show()
        .insertBefore($target[0])
        .trigger('autosize')
        .focus();
              
      e.stopPropagation();            
    },   
    clickEditor: function(e) {
      e.stopPropagation();
    },
    showMenu: function(e) {
      // detect model from e.target
      var $target = $(e.target).parents('li'),
        cid = $target.attr('data-model-cid'),
        model = this.collection.getByCid(cid),
        index = this.collection.indexOf(model) + 1;            
      this.$editor
        .data('target', {
          index: index
        })
        .insertAfter($target[0])
        .show()
        .focus();
      e.stopPropagation();
      // $(document).one('click', function() {
      //   $editor.hide();
      // });
      // $editor.one('focusout', _.bind(function(e) {
      //   var val = this.$editor.val();
      //   if(val.replace(/\s+/g).length) {
      //     // create new test model
      //     var textModel = new M['MashUpModel']({
      //       type: 'text',
      //       text: val
      //     });
      //     console.dir( textModel );
      //     this.collection.add(textModel, {
      //       at: index
      //       //silent: true
      //     });
      //     // var obj = textModel.toJSON();
      //     //  obj.cid = textModel.cid;
      //     //  obj = [obj];
      //     //  $target.after(this.template({models: obj}));
      //   }
      //   this.$editor.hide().val('');
      //   this.$editor.hide();
      //   this.updateCache();
      // }, this));
      
      // this.$editor  
      // stub show input
      // this.collection.add()
      
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
    deleteClicked: function(e) {
      console.log('remove');
      var $target = $(e.target).parents('li'),
        cid = $target.attr('data-model-cid');
      
      var model = this.collection.getByCid(cid);
      this.collection.remove(model, {
        silent: true
      });
      $target.remove();
      this.updateCache();
    },    
    change: function(model, options) {
      var cid = model.cid;
        element = this.template({models: U.toJSONArray(model)}),
        $target = this.$articleItems.find('[data-model-cid='+cid+']');
            
      $target
        .after(element)
        .remove();
      this.updateCache();
    },
    updateCache: function() {
      var cache = this.collection.toJSON();
      console.log('this.collection.length : ' + this.collection.length);
      
      // TODO JSON poryfill
      localStorage.removeItem('mr');
      localStorage.setItem('mr', JSON.stringify(cache));      
    },
    loadCache: function() {
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
    getJson: function(model) {
      var ret = model.toJSON();
      ret.cid = model.cid;
      return ret;
    },    
    addItem: function(model) {
      console.log('add item article');
      var index = this.collection.indexOf(model),
        beforeCid = this.collection.at(index-1).cid,
        $beforeEl = this.$articleItems.find('[data-model-cid='+beforeCid+']'),
        element = this.template({models: U.toJSONArray(model)});
      if(!$beforeEl.length) {
        throw new Error('no such cid element: ' + beforeCid);
        return;
      }
      $beforeEl.after(element); 
    },
    render: function() {
      var obj = this.collection.toJSONWithCid();
      this.renderByModels(obj);
    },
    renderByModels: function(models) {
      console.log('render article');      
      //_.isArray(obj) || (obj = [obj]);            
      var element = this.template({models: models});
      console.log('element : ' + element);
      this.$articleItems.empty();
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