(function($, _, Backbone, undefined){
  

// jQuery plugin 
(function($, _){
  
  // insertive, acceptive
  var defaults = {
    item : 'li',
    zIndex : 1000,
    appendTo : 'body',
    cloneClass : 'dragging',
    selectClass : 'selected',
        
    insertive : true,
    insertiveTo : '*',
    
    acceptive : true,
    acceptiveFrom : '*',
    
    selfSortive : true
  },
  
  // store all sortive instance
  container = [ ],  
  
  // internal variable
  currentIndex,
  
  methods = {
    init : function(options) {
      var options = $.extend({}, defaults, options);
      // reset all sortive elements
      // determine which containers is acceptive to this
      this.each(function() {
        container.push(this);        
      });
      
      this
        .data('sortive', options)
        .on('mousedown.sortive', options.item, options, downHandler);
        
      return this;
      //this.data('sortable', )
    },
    destroy : function() {
      //var $this = $.data(this, 'sortive');
      var index = _.indexOf(this);
      container.splice(index);
      this.off('mousedown.sortive', downHandler);
      return this;
    },
    
    options : function(options) {
      if(!options) {
        // getter
        // return 
      }
      // setter            
    }
    
    // return acceptive sortive objects from context
    // used to get dimensions of sortives when mouse drag start
    // if selfSortive is true, and insertive is false, return only context itself
    // TODO - what if context length is not 1 ???
    // acceptives : function() {
    //   var acceptives = [ ],
    //       options = this.data('sortive-options')
    //   
    //   if(options.selfSortive) {
    //     acceptives.push(this[0]);
    //   }
    //   if(options.insertive) {
    //     //insertiveTo
    //   }
    //   
    //   return acceptives;
    // }
    
    // return array of dimension

    // ,
    //     
    //     _sort : function() {
    //       
    //     }
    
  },
  
  
  // 
  // should map like this from options
  // { el0 : { acceptive : [ el0, el1 ], insertive : [ ] },
  //   el1 : { acceptive : [ ], insertive : [ el0 ] } // selfSortive = false
  //}
  // updateMap = function() {
  //   _.each(sortives, function(sortive) {
  //     var $sortive = $(sortive),
  //         options = $sortive.options;      
  //     // 
  //     $sortive.data('sortive', {
  //       acceptive : [ ],
  //       insertive : [ ]
  //     });
  //     
  //     
  //   });
  // },
  
  getAcceptives = function($sortive) {
    var ret = [ ];        
    
    _.each(container, function(sortive) {
      var options = $(sortive).data('sortive');
      if(!$sortive.is(sortive)) {
        // TODO - set limit by selector, using acceptiveFrom or insertiveTo
        options.acceptive && ret.push(sortive);
      } else {
        options.selfSortive && ret.push(sortive);
      }      
    });
    
    return ret;
  },
  
  getRects = function(sortives, $target) {      
    return _.map(sortives, function(sortive) {
      var $sortive = $(sortive),
      selfOffset = $sortive.offset(),
      rect = _.extend( {}, selfOffset, {
        right : selfOffset.left + $sortive.width(),
        bottom : selfOffset.top + $sortive.height()
      }),
      dimensions = {
        top : [],
        bottom : []
      };
      
      // TODO add selector for children
      $sortive.children().each(function() {      		
		    var $self = $(this),
		        offset = $self.offset();
			  dimensions.top.push(offset.top);
			  dimensions.bottom.push(offset.top + $self.height());			  			  			  
		  });

		  var isSelfSort = $target.is(sortive);
		  
    	return {
    	  rect : rect,
    	  children : dimensions,
    	  isSelfSort : isSelfSort
    	};     	
    });
  },
  
  // return dimensions without element
  // getCache = function(element) {
  //   var cache = {
  //    top : [],
  //    bottom : []
  //  };
  //  // TODO  
  //  this.siblings().each(function() {
  //    if( this !== element ) {
  //      var $self = $(this),
  //          offset = $self.offset();
  //      cache.top.push(offset.top);
  //      cache.bottom.push(offset.top + $self.height());
  //    } else {
  //      console.log('this is element ');
  //    }
  //  });
  // 
  //  return cache;
  // },
  
  downHandler = function(e) {  
    // if( $el ) {
     //   throw new Error('$el is not removed')
     //   mouseUpHandler.call(this);
     // }  
  	var options = e.data,
  	$self = $(this),
  	$sortive = $(e.delegateTarget),
    offset = $self.offset(),
    w = $self.width(),
    h = $self.height(),
    
           	 
    $clone = $self
      .clone()
      .css({
        left : offset.left,
        top : offset.top,
        position : 'absolute',
        width : w,
        height : h,
        zIndex : options.zIndex
      })
      .addClass(options.cloneClass)
      .appendTo(options.appendTo),

    offsetX = $clone.offset().left - e.clientX,
   	offsetY = $clone.offset().top - e.clientY,
    
    acceptives = getAcceptives($sortive),
    
    rects = ( !!acceptives.length && getRects(acceptives, $sortive)),
  	
  	data = {
  	  $original : $self,
  	  $clone : $clone,
  	  rects : rects,  		  
  	  offsetX : offsetX,
  	  offsetY : offsetY,
  	  centerOffsetX : w * 0.5,
  	  centerOffsetY : h * 0.5,
  	  height : h,
      originalIndex : $self.index(),
      $sortive : $sortive,
  	  options : options
  	};  	
    
    currentIndex = data.originalIndex;
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
    
    e.data.$sortive.trigger('drop', {
      
      
    });
  },
  
  isOutOfBound = function(rect, x, y) {
    return x < rect.left || x > rect.right || y < rect.top || y > rect.bottom;
  },
  
  moveHandler = function(e) {
    var data = e.data,
    $clone = data.$clone,
    offset = {
      left : data.offsetX + e.clientX,
      top : data.offsetY + e.clientY
    },        
    rects = e.data.rects,
    // TODO currently only support up and down
    direction;
                    
    $clone.css(offset);
    if( !data.rects ) {
      return;
    }
    var x = offset.left + data.centerOffsetX,
        y = offset.top + data.centerOffsetY,
        rects = data.rects;
    
    var targetRect = _.find(data.rects, function(rect) {
      return !isOutOfBound(rect.rect, x, y);
    });
    
    if(targetRect) {
      // if targetRect is selfRect, drop dragging rect
      var dimensions = targetRect.children;
      if(targetRect.isSelfSort){                        
        dimensions = {
          top : dimensions.top.concat(),
          bottom : dimensions.bottom.concat()
        };
        dimensions.top.splice(data.originalIndex, 1);
        dimensions.bottom.splice(data.originalIndex, 1);
        
      }
      
      
      if( data.$original.offset().top < offset.top ) {
    		// move up
    		direction = 'bottom';
    		offset['bottom'] = offset.top + data.height;
    		
    	} else {
    		// move down
    		direction = 'top';			
    	}
    	    	
    	var index = _.sortedIndex( dimensions[direction], offset[direction]);
    	console.log('index : ' + index);
    	
     // if(index != currentIndex) {
      //        currentIndex = index;
      //        data.$sortive.trigger('indexchange', {
      //          originalIndex : data.originalIndex,
      //          index : index,
      //          direction : direction,
      //          // current elements dimension
      //          dimension : {
      //            top : data.cache.top[index],
      //            bottom : data.cache.bottom[index]
      //          }
      //        });
      //      }
      
    }
    
    


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
  item : 'div',
  connectWith : '#right-column'
})
.on('indexchange', function(e, data) {
  console.log('index change catch');
  console.dir( data );
  var isOriginal = data.index === data.originalIndex;  
  if(isOriginal) {
    $('#marker').removeClass('active');
  } else {
    // TODO
    var offset = data.direction === 'up' ? 20 : -20;
    var css = offset + data.dimension.top;
    
    console.log('css : ' + css);
      
    $('#marker')
    .addClass('active')
    .css({
      top : css
    });        
  }  
})
.on('drop', function(e, data) {
  console.log('drop');
  $('#marker').removeClass('active');
});



// $('#right-column').sortive({
//   item : 'div',
//   
// });


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

  var LeftView = new PlaneListView({
    collection : new PlaneCollection(getModels(10)),
    el : '#left-column'
  });
  

  var RightView = new PlaneListView({
    collection : new PlaneCollection(getModels(10)),
    el : '#right-column'
  });
  //$('#left-column').append(divs);
  //$('#right-column').append(getDivs(20));
})();
		



// return dimension witout element

})(jQuery, _, Backbone);