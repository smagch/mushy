define(['modules/util'], function(U) {

  // alias
  var Items = { },
    M = { },
    C = { };
      
  M['MashUpModel'] = Backbone.Model.extend({
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
      }
  });

  var ArticleView = Backbone.View.extend({
    el: '#article',
    template: 'quote-list-template',
    initialize : function() {
      this.template = U.templates[this.template];
      this.$editor = this.$('#article-editor');
      this.$editor
        .autosize()
        .hide();
      
      this.collection = new C['MashUpCollection']();
      this.collection
        .on('add', this.addItem, this )
        .on('reset', this.render, this )
        .on('remove', this.removeItem, this)
        .on('change', this.change, this );
      
      this.$articleItems = this.$('#article-list');
      this.$articleItems
        .sortive({
          item: 'li',
          scrollElement: '#article'
        })
        .on('indexchange', _.bind(this.indexChangeHandler, this))
        .on('itemmove', _.bind(this.moveItem, this))
        //.on('sortfocusin', _.bind(this.sortFocusIn, this))
        .on('sortfocusout', _.bind(this.sortFocusOut, this));
      
      this.$('#description-input').autosize();
      this.loadCache();
    },
    events : {
      'focusout #article-editor': 'leaveTextEdit',
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
        .insertBefore(this.$articleItems)
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
    },
    deleteClicked: function(e) {
      var $target = $(e.target).parents('li'),
        cid = $target.attr('data-model-cid');
      
      var model = this.collection.getByCid(cid);
      this.collection.remove(model, {
        silent: true
      });
      $target.remove();
      this.updateCache();
    },
    removeItem: function(model) {
    },
    change: function(model, options) {
      var cid = model.cid,
        element = this.template({models: U.toJSONArray(model)}),
        $target = this.$articleItems.find('[data-model-cid='+cid+']');
      
      $target
        .after(element)
        .remove();
      this.updateCache();
    },
    updateCache: function() {
      var cache = this.collection.toJSON();
      
      // TODO JSON poryfill
      localStorage.removeItem('mr');
      localStorage.setItem('mr', JSON.stringify(cache));
    },
    loadCache: function() {
      var cache = localStorage.getItem('mr');
      if(cache) {
        var obj = JSON.parse(cache);
        this.collection.reset(obj);
      }
    },
    indexChangeHandler: function(e, data) {
      var index = data.index;
      if(data.isSelfSort && data.index.from === data.index.to) {
        // original position
        // console.log('original position');
      } else {
        //console.log('data.index.to : ' + data.index.to);
        //console.log('data.index.from : ' + data.index.from);
      }
    },
    moveItem: function(e, data) {
      var index = data.index.to,
        $target = data.$original,
        cid = $target.attr('data-model-cid'),
        model = this.collection.getByCid(cid);

      this.collection
        .remove(model, { silent: true })
        .add(model, { at: index });
      
      $target.remove();
      this.updateCache();
    },
    sortFocusIn: function(e) {
      //console.log('focus in');
    },
    sortFocusOut: function(e) {
      //console.log('focus out');
      // var index;
      //                 var model = new M['MashUpModel']({
      //                   text : 'hoge'
      //                 });
      //                 this.collection.add(model);
    },
    addItem: function(model) {
      var index = this.collection.indexOf(model),
        beforeCid = this.collection.at(index-1).cid,
        $beforeEl = this.$articleItems.find('[data-model-cid='+beforeCid+']'),
        element = this.template({models: U.toJSONArray(model)});
      if(!$beforeEl.length) {
        throw new Error('no such cid element: ' + beforeCid);
      }
      $beforeEl.after(element);
      this.updateCache();
    },
    render: function() {
      var obj = this.collection.toJSONWithCid();
      this.renderByModels(obj);
    },
    renderByModels: function(models) {
      //_.isArray(obj) || (obj = [obj]);
      var element = this.template({models: models});
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