

// TODO - and then build glue and sissor tool
// TODO - and then make them work with popcorn

// TODO - select span when youtube slider is moving, ask.
// TODO - make time-input correct using Popcorn util


// TODO - should be able to parse subtitle format.
// TODO - should be able to parse span with data-start, data-end
// TODO - pollyfill for dataset nad classList
// TODO - currently only span element
// TODO - auto scroll
// TODO - add option which enable cue beforehand, something like currentTime(start - option.***)
// TODO - add option like withEditor?

// senario
// 1. stand alone, not with editor
// 	1.1 load transcipt file and create span element in container
//  1.2 load span element in container

// 2. with editor
// 	2.1 user edit transcript from scratch
//  2.2 user load transcript and then edit
//  2.3 user load untracked transcript and then edit
//  2.4 user use more than one container for translating

(function($, Popcorn, Backbone, _, undefined){
  // TODO - make time input realtime
  // TODO - add time input keyboard event
  // TODO - add space toggle
  
  // 
  var TrackModel = Backbone.Model.extend({
    defaults : {
      start : -1,
      end : -1,
      //_running : false,
  		target : 'text-container',
  		isEditing : false
    }
  });
  
  var TrackCollection = Backbone.Collection.extend({
    model : TrackModel,
    comparator : function(track) {
      return track.start;
    }
  });
  
  var TrackView = Backbone.View.extend({
    initialize : function() {
      this.model.bind( 'change', this.render, this );      
    },
    template : _.template('<span data-start=<%= model.start %> data-end=<%= model.end %> ><%= text %></span>'),
    events : {
      
    },
    render : function() {
      // var attributes = this.model.changedAttributes();
      //       if( attributes.length === 1 && attributes[ 'isEditing' ] ) {
      //         //
      //       }
      
      $(this.el).html( 
        this.template({
          model : this.model.toJSON()
        })
      );
      return this;
    }
  });
  
  var Tracks = new TrackCollection();
  
  var TranscriptView = Backbone.View.extend({
    el : $('#text-container'),
    models : Tracks,
    initialize : function() {
      var self = this;
      this.models.bind( 'change:start', this.changeSelect, this );      
      this.models.bind( 'add', this.addSpan, this );        
    },
    
    events : {
      
    },
    
    changeSelect : function( model ) {
      console.log('change select');
      console.dir(model);
    },
    
    addSpan : function( model ) {
      // search where to insert
      console.log('addSpan');
      // var index = this.model.sortedIndex();
      // var span = new TrackView( model );
      // //this.el.after
    }
       
  });
  
  var InputView = Backbone.View.extend({
    el : $('#inputs'),
    textInput : $('#text-input'),
    startInput : $('#time-input-start'),
    endInput : $('#time-input-end'),
    events : {
      'keyup #text-input' : 'updateText',
      'keyup #time-input-start' : 'updateStart',
      'kyeup #time-input-end' : 'updateEnd'
      //'focusout #time-input' : ''
    },
    
    editingModel : undefined,
    
    initialize : function() {
      Tracks.bind( 'change:isEditing', this.render, this );
    },
    
    isEditingTrack : function( track ) {
      return ( this.editingModel && this.editingModel.id == track.id );
    },
    
    updateText : function() {
            
      var text = this.textInput.val();      
      if( this.editingModel ) {
        
    		this.editingModel.set({ text : text });
    		
    	} else {
    	  if( val !== '') {
    	    // Create new model
    	    var start = this.startInput.val(),
    	        end = this.endInput.val(),
    	        id = Popcorn.guid('itranscript'),
    	        obj = {
    	          start : start,
    	          end : end,
    	          id : id
    	        };
    	    
    	    Tracks.add( new TrackModel( obj ) );    	    
          //youtube.itranscript( obj );
          //setCurrentTrackById( id );
    	  }  	  
      }
    },
    
    updateStart : function() {
      
    },
    
    updateEnd : function() {
      
    },
    
    updateTrack : function( options ) {
      if( this.editingModel ) {        
        this.editingModel.set( options );
        // trigger ??
        //var 
        //var currentModel = Tracks.get( this._currentTrack._id );
        //currentModel.set( options );
      }
    },    
    
    render : function( model ) {
      if( model.isEdit ) {
        this.editingModel = model;
        this.textInput.val( model.text );
        this.startInput.val( model.start );
        this.endInput.val( model.end );
      } else {        
        if( !this.editingModel ) {
          this.textInput.val('');
          // TODO ok?
          this.startInput.val('');
          this.endInput.val('');
        }
      }
    }        
  });
  
  var AppView = Backbone.View.extend({
        
    //_currentTrack : undefined,
    _currentId : undefined,
    player : undefined,
    inputView : new InputView,
    initialize : function() {
      Popcorn.plugin.debug = true;
      var self = this;
      // $(document).on('mouseup', function (e) {
      //         function isReset(target) {                                    
      //           if( !$(target).is( 'input' ) && !$(target).parents( '#video' ).length ) {
      //             return true;
      //           }
      //           return false;
      //         }
      // 
      //         if( this.currentTrack && isReset( e.target )) {            
      //           console.log('document click');        
      //           
      //           
      //         }
      //         e.stopPropagation();
      //       });
      
      var player = this.player = Popcorn.youtube( '#video', 'http://www.youtube.com/watch?v=CxvgCLgwdNk' );      
      
      
      // TODO - it's possible to load differenct trackEvent.
      player.listen('trackend', function ( track ) {
        console.log( 'trackend' );       
        var trackModel = Tracks.get( track._id );
        if( trackModel.get( 'isEditing' ) ) {
          trackModel.set( { isEditing : false } );
        }              	
      });
      
      player.listen('trackchange', function (track) {
        console.log('trackchange');      	
      	var trackModel = Tracks.get( track._id );
      	if( trackModel ) {
      	  trackModel.set( { isEditing : true });
      	}
      	
      });
      
      player.listen('notimeselect', function ( track ) {			
      	console.log('notimeselect');
      	// TODO	
      });
      
      Tracks.bind('add', function( trackModel ) {
        var options = trackModel.toJSON();    
        delete options['isEditing'];
        player.addTrackEvent( options );
      });
      
      player.listen( 'reset', function( tracks ) {
        console.log('add');
        Tracks.reset(tracks);
      });
      
      player.itranscript({
       target : 'text-container',
       withEditor : true
       //subtitle : '/subtitles/drTyNDRnyxs.srt'// url
      });
      
      player.play();
      // for debug
      window.player = player;
    },        
    

    
    // Move players currentTime
    updateStart : function() {
      if ( !this.player.paused() ) {
        this.player.pause();
      }
      
      var start = $('#time-input-start').val();
      if ( this._currentTrack ) {
        this._currentTrack.start = start;
        
        // also change Trackmodel
        // this._currentTrack.sta
        var currentModel = Tracks.get( this._currentTrack._id );
        currentModel.set( { start : start } );
      } 
      this.player.currentTime( start );      
      // 
    },
    // 
    updateEnd : function() {
      //if( )
      if ( this._currentTrack ) {
        var end = $('#time-input-end').val();
        this._currentTrack.end = end;
        var currentModel = Tracks.get( this._currentTrack._id );
        currentModel.set( { end : end } );
      }
    },
    
    
    selectEdit : function() {
      //$( '#'+ currentTrack._id ).addClass('editing');
    	// callbacks.push(function () {
    	//         $('#'+ id).removeClass('editing');        
    	//       });
    }
    
    
    
  });

  var App = window.App = new AppView();
  

  // youtube.listen('playing', function (e) {
  //     console.log('playing');
  // });
  // 
  // youtube.listen('play', function (e) {
  //     console.log('play');
  // });
  // 
  // youtube.listen('waiting', function (e) {
  //     console.log('wating');
  // });
  // youtube.listen('abort', function (e) {
  //     console.log('abort');
  // });
  // 
  // youtube.listen('ratechange', function (e) {
  //     console.log('ratechange');        
  // });
  // 
  // youtube.listen('ended', function (e) {
  //     console.log('ended');
  // });
  // 
  // youtube.listen('seeked', function (e) {
  //      console.log('----seeked----');
  // });
  // 
  // youtube.listen('seeking', function (e) {
  //      console.log('++++seeking++++');
  // });


})(jQuery, Popcorn, Backbone, _ );

    

    



