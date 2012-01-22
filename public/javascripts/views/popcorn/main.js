

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
  		target : 'text-container'
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
    template : _.template('<span data-start=<%= model.start %> data-end=<%= model.end %> ><%= model.text %></span>'),
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
  
  var Tracks = window.Tracks = new TrackCollection();
  
  
  var TranscriptView = Backbone.View.extend({
    el : $('#text-container'),
    models : Tracks,
    initialize : function() {
      var self = this;
      //this.models.bind( 'change:start', this.changeSelect, this );      
      this.models.bind( 'add', this.addTrack, this );
    },
    
    events : {
      
    },
    
    changeSelect : function( model ) {
      console.log('change select');
      console.dir(model);
    },
    
    addTrack : function( model ) {
      // search where to insert
      console.log('addSpan');
      // var index = this.model.sortedIndex();
      // var span = new TrackView( model );
      // //this.el.after
      var trackView = new TrackView( { model : model } );
      //$( trackView.el ).appendTo( this.el );
      this.el.append( trackView.render().el );
    }
       
  });
  
  var InputView = Backbone.View.extend({
    el : $('#inputs'),
    _targetModelModel : undefined,
    textInput : $('#text-input'),
    startInput : $('#time-input-start'),
    endInput : $('#time-input-end'),
    events : {
      'keyup #text-input' : 'updateText',
      'keyup #time-input-start' : 'updateStart',
      'kyeup #time-input-end' : 'updateEnd'
      //'focusout #time-input' : ''
    },        
    
    initialize : function() {
      //Tracks.bind( 'change:isEditing', this.render, this );
    },
    
    isEditingTrack : function( track ) {
      return ( this.editingModel && this.editingModel.id == track.id );
    },
    
    updateText : function() {
      var val = this.textInput.val();
      if( this._targetModel ) {
        this._targetModel.set({ text : val });
    	} else if ( val !== '') {
    	  var start = this.startInput.val(),
    	      end = this.endInput.val();
    	  ( start === '' ) && ( start = -1 );
    	  ( end === '' ) && ( end = -1 );    	          	  

    	  Player.itranscript({
    	    start : start,
    	    end : end,
    	    text : val,
    	    target : 'text-container',
    	    //id : Popcorn.guid('itranscript')// because option inside _setup has no _id
    	  });    	      	            
      }
    },
    
    // Move players currentTime
    updateStart : function() {
      // if ( !this.player.paused() ) {
      //         this.player.pause();
      //       }
      
      // var start = $('#time-input-start').val();
      //       if ( this._currentTrack ) {
      //         this._currentTrack.start = start;
      //         
      //         // also change Trackmodel
      //         // this._currentTrack.sta
      //         var currentModel = Tracks.get( this._currentTrack._id );
      //         currentModel.set( { start : start } );
      //       } 
      //       this.player.currentTime( start );      
      // 
      this.updateTrack( { start : this.startInput.val() } );
    },
    // 
    updateEnd : function() {
      this.updateTrack( { end : this.endInput.val() } );
    },
    
    updateTrack : function( options ) {
      if( this._targetModel ) {
                
        this._targetModel.set( options );
                                        
      } else if( options.text && options.text !== '' ) {

      }
    },    
    
    setTarget : function( model ) {
      console.log('render');
      if( model ) {
        console.log('fillInput');
        this._targetModel = model;
        this.textInput.val( model.get( 'text' ) );
        this.startInput.val( model.get( 'start' ) );
        this.endInput.val( model.get( 'end' ) );        
      } 
    },
    
    setTargetById : function( id ) {
      var target = Tracks.get(id);
      if( target ) {
        this.setTarget( target );
      } else {
        throw new Error( 'there is no such id : ' + id );
      }
    },
    
    removeTarget : function( model ) {
      if ( model === this._targetModel ) {
        console.log('dropInputs');
        this.textInput.val('');
        // TODO ok?
        this.startInput.val('');
        this.endInput.val('');
        this._targetModel = undefined;
      }
    }      
  });
  
  var Player = Popcorn.youtube( '#video', 'http://www.youtube.com/watch?v=CxvgCLgwdNk' );      
  
  var AppView = Backbone.View.extend({
        
    //_currentTrack : undefined,
    _currentId : undefined,
    player : undefined,
    inputView : new InputView,
    transcriptView : new TranscriptView,
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
      
      var player = this.player = Player;
      
      
      // TODO - it's possible to load differenct trackEvent.
      player.listen('trackend', function ( track ) {
        console.log( 'trackend' );       
        var trackModel = Tracks.get( track._id );
        if( trackModel ) {
          //trackModel.set( { isEditing : false } );
          self.inputView.removeTarget( trackModel );
        } else {
          console.dir( track );
        }              	
      });
      
      player.listen('trackchange', function (track) {
        console.log('trackchange');      	
      	var trackModel = Tracks.get( track._id );
      	if( trackModel ) {
      	  //trackModel.set( { isEditing : true });
      	  self.inputView.setTarget( trackModel );
      	} else {
      	  console.log('there is no such id');
      	  console.dir( trackModel );
      	  
      	}      	
      });
      
      player.listen('notimeselect', function ( track ) {			
      	console.log('notimeselect');
      	// TODO	
      });
      
      player.listen( 'add', function( track ) {
        console.log('add');
        Tracks.add( track );
        console.dir( track );
        self.inputView.setTargetById( track.id );
      });
      
      // Tracks.bind('add', function( trackModel ) {
      //         var options = trackModel.toJSON();    
      //         delete options['isEditing'];
      //         player.addTrackEvent( options );
      //       });
      
      player.listen( 'reset', function( tracks ) {
        Tracks.reset( tracks );
      });
      
      player.itranscript({
       target : 'text-container',
       withEditor : true,
       start : -1,
       end : -1
       //subtitle : '/subtitles/drTyNDRnyxs.srt'// url
      });
      
      player.play();
      // for debug
      window.player = player;
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

    

    



