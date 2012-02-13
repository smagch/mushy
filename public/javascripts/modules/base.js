define(['modules/left-view', 'modules/right-view', 'modules/util'], function(LV, RV, U){
  // base view
  
  var RightColumn = Backbone.View.extend({
    el : '#right-column',
    currentCollection : function() {
      return this.contentView.currentCollection();
    },
    initialize : function () {
      var content = this.contentView = RV.getInstance();//new RV.ContentView();
      this.$searchInput = $('#search-input');
      $('#search-tab').tabs()
        .on('tabsselect', function(e, ui) {
          var key = [ ];
          // TODO write more nicely
          key.push(ui.panel.id.split('-')[2]);        
          var secoundKey = $( ui.panel ).children('span.selected').text().replace(/\s+/g, '');
          if( secoundKey !== '' ) {
            key.push( secoundKey );
          }        
          content.changeView( key.join('-') );
        })
        .on('click', 'span.button', function(e) {
          console.log('span clicked');
          var category =  
            $( e.target )
              .addClass('selected')
              .siblings('.selected')
                .removeClass('selected')
                .end()
              .text().replace(/\s+/g, '');
          console.log('category : ' + category);            
          content.changeCategory( category );
        });
                                          
        content.on('viewchange', this.viewChangeHandler, this );
      },       
      events : {
        'keyup #search-input' : 'keyupHandler'                                       
      },    
      keyupHandler : function( e ) {
        if( e.keyCode === 13 ) {
          this.viewChangeHandler();
        }
      },
      viewChangeHandler : function() {
        var val = this.$searchInput.val();
        if( val !== '' ) {
          this.contentView.doQuery(val);
        }
      }
  });
  
  var LeftColumn = Backbone.View.extend({
    el : '#article',
    initialize : function() {
      //this.collection = new C['MashUpCollection']();
      //this.collection.on('add', this.addItem, this );
      this.articleView = LV.getInstance();//new LV.ArticleView();          
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
      //var json = model.toJSON();
      //console.dir( json );
      // TODO index      
      this.leftColumn.addModel(model.toJSON(), data.index.to );
      currentCollection.remove( model);                                          
    }
  });
  
  return {
    start: function() {
      console.log('start');
      U.precompileTemplates();
      console.log('tempcomp');
      new AppView();
    }
  };
});