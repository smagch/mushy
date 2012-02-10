define(['modules/left-view', 'modules/right-view', 'modules/models', 'modules/util'], function(LV, RV, M, U){
  // base view
  var B = {
    Views: {}
  },
  V = B.Views;
  
  V.RightColumn = Backbone.View.extend({
    el : '#right-column',
    currentCollection : function() {
      return this.contentView.currentCollection();
    },
    initialize : function () {
      var content = this.contentView = new RV.ContentView();
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
  
  V.LeftColumn = Backbone.View.extend({
    el : '#article',
    initialize : function() {
      //this.collection = new C['MashUpCollection']();
      //this.collection.on('add', this.addItem, this );
      this.articleView = new LV.ArticleView();          
    },
    events : {
    
    },
    addModel : function( model ) {
      this.articleView.collection.add( model );
    }                
  });
    
  V.AppView = Backbone.View.extend({
    el: '#content',
    initialize: function() {
      this.leftColumn = new V.LeftColumn();
      this.rightColumn = new V.RightColumn();                                                                                  
      var self = this;          
      $('#search-content')
      .sortive({
        itemTag : 'li',
        selfSort : false
      })
      .on('itemsend', _.bind( this.sendItem, this) );
    },
    events: {
    
    },
    sendItem: function( e, data ) {            
      var currentCollection = this.rightColumn.currentCollection();
        
        //var model = currentCollection.getByCid(id);                
      var model = currentCollection.at(data.fromIndex);
      var json = model.toJSON();
      console.dir( json );
      
      this.leftColumn.addModel(model.toJSON() );
      currentCollection.remove( model);                                          
    }
  });
  
  B.start = function() {
    console.log('start');
    U.precompileTemplates();
    console.log('tempcomp');
    new V.AppView();
  }
  
  return B;
});