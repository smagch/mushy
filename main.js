(function($, _, Backbone, undefined){
  
  
// setup




// jQuery plugin 
(function($, _){
  var defaults = {
    item : 'li',
    zIndex : 1000,
    appendTo : 'body',
    cloneClass : 'dragging',
    selectClass : 'selected'
  },
  
  // internal variable
  currentIndex,
  
  methods = {
    init : function(options) {
      // pass options as data
      var options = $.extend({}, defaults, options);
      //$('#left-column > div').on('mousedown', downHandler);
      return this.on('mousedown.sortive', options.item, options, downHandler);
      //this.data('sortable', )
    },
    destroy : function() {
      //var $this = $.data(this, 'sortive');            
      this.off('mousedown.sortive', downHandler);
      return this;
    }
    
  },
  
  // return dimensions without element
  getCache = function(element) {
    var cache = {
  		top : [],
  		bottom : []
  	};
  	// TODO  
  	this.siblings().each(function() {
  		if( this !== element ) {
  		  var $self = $(this),
  		      offset = $self.offset();
  			cache.top.push(offset.top);
  			cache.bottom.push(offset.top + $self.height());
  		} else {
  			console.log('this is element ');
  		}
  	});

  	return cache;
  },
  
  downHandler = function(e) {  
    // if( $el ) {
     //   throw new Error('$el is not removed')
     //   mouseUpHandler.call(this);
     // }  
  	var options = e.data,
  	$self = $(this),
    offset = $self.offset(),
           	 
    $clone = $self
      .clone()
      .css({
        left : offset.left,
        top : offset.top,
        position : 'absolute',
        width : $self.width(),
        height : $self.height(),
        zIndex : options.zIndex
      })
      .addClass(options.cloneClass)
      .appendTo(options.appendTo),

    offsetX = $clone.offset().left - e.clientX,
   	offsetY = $clone.offset().top - e.clientY,

  	cache = getCache.call($self, this),
  	  	
  	data = {
  	  $original : $self,
  	  $clone : $clone,
  	  cache : cache,  		  
  	  offsetX : offsetX,
  	  offsetY : offsetY,
  	  height : $self.height(),
      index : $self.index(),
      delegateTarget : e.delegateTarget,
  	  options : options
  	};  	
    
    currentIndex = data.index;
    $self.addClass(options.selectClass),
  	$(document)
  		.on('mousemove.sortive', data, moveHandler)
  		.on('mouseup.sortive', data, upHandler);
  },
  
  upHandler = function(e) {
    $(document)
  		.off('mousemove.sortive', moveHandler)
  		.off('mouseup.sortive', upHandler);
  	
  	var data = e.data;
    data.$original.removeClass(data.options.selectClass);
    data.$clone.remove();
  },
  
  moveHandler = function(e) {
    var data = e.data,
    offset = {
      left : data.offsetX + e.clientX,
      top : data.offsetY + e.clientY
    },        
    cache = e.data.cache,
    // TODO currently only support up and down
    direction;
                    
    data.$clone.css(offset);
  	if( data.$original.offset().top < offset.top ) {
  		// move up
  		direction = 'bottom'
  		offset['bottom'] = offset.top + data.height;
  	} else {
  		// move down
  		direction = 'top'			
  	}					
  	var index = _.sortedIndex( cache[direction], offset[direction]);
  	if(index != currentIndex) {
  	  currentIndex = index;
  	  //this.trigger('indexChange')
  	  $(data.delegateTarget).trigger('indexchange');
  	}
  	//trigger('indexchange')
  	
  };
  
  
  
  $.fn['sortive'] = function(method) {
    if( methods[method] ) {
      return methods[method].apply(this, Array.prototype.slice.call( arguments, 1 ));
    } else if( typeof method === 'object' || !method ){
      return methods['init'].apply(this, arguments);
    } else {
      $.error( 'Method ' +  method + ' is invalid' );
    }
  }
  
})(jQuery, _);



var PlaneModel = Backbone.Model.extend({});
var PlaneCollection = Backbone.Collection.extend({
  model : PlaneModel
});
var PlaneView = Backbone.View.extend({
  tagName : 'div',
  initialize : function() {
    
  },
  //template : _.template('<div></div>'),
  render : function() {
    this.$el.css(this.model.toJSON());
          
    return this;
  }
});
var PlaneListView = Backbone.View.extend({
  el : '#left-column',
  initialize : function() {
    //this.collection = new PlaneCollection();
    this.collection
      .on('add', this.addItem, this)
      .on('change', this.change, this)
      .on('reset', this.render, this);
    this.render();
  },
  change : function() {
    console.log('change');
  },
  addItem : function(model) {
    console.log('add');
    if(_.isArray(model)) {
      model.each(this.createItem);
    } else {
      this.createItem(model);
    }
  },
  createItem : function(model) {
    console.log('create');
    var view = new PlaneView({model: model});
    this.$el.append(view.render().el);
  },
  render : function() {
    console.log('render');
    this.$el.html('');
    if( this.collection.length ) {                    
      this.collection.each( this.createItem, this );
    } 
    return this;                    
  }
});
  

$('#left-column').sortive({
  item : 'div'
})
.on('indexchange', function(e) {
  console.log('index change catch');
});


// setup
(function(){
  var getColor = function() {
        return (Math.random() * 0xFFFFFF >> 0).toString(16); 
      },
      getHeight = function() {
        return 50 + Math.floor(Math.random() * 50);
      },
      getModel = function() {
        return {
          background: getColor(),
      		height : getHeight()
        };
      },
      getModels = function(num) {
        var models = [];
        for(var i=0; i < num; i++) {
          models.push(getModel());
        }
        return models;
      };
  var collection = new PlaneCollection(getModels(10));

  var LeftView = new PlaneListView({
    collection : collection
  });
  //$('#left-column').append(divs);
  //$('#right-column').append(getDivs(20));
})();
		



// return dimension witout element

})(jQuery, _, Backbone);