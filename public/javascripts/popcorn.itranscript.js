
// Intaractive transcript plugin
(function(Popcorn){
  Popcorn.plugin('itranscript', (function(){
    
    // Register container by id. value is just 1
    // Allow more than one transcript container
    var containers = { };
    
    var parseSpan = function(player, container, options) {
      var spans = container.getElementsByTagName('span'),
          containerId = container.id;
      
      var models = [ ];
      
      Popcorn.forEach( spans , function (span, index) {         
        var id = span.id = Popcorn.guid('itranscript'),
            start = span.getAttribute('data-start'),
            end = span.getAttribute('data-end');

        Popcorn.addTrackEvent( player, {
          start : start || -1,
          end : end || -1,
          id : id,
          _running : false,
          compose : [],
          effect : [],
          target : containerId,
          _natives : options._natives
        });
        
        models.push( {
          start : start || -1,
          end : end || -1,
          id : id,
          target : containerId
        });
      });
      
      player.trigger( 'reset', models );
    }
    
    // Delegate event to span element
    var clickHandler = function ( player, e ) {
      console.log('clicked');
      if( e.target.tagName !== 'SPAN' || !e.target.id) {
        return;
      }
      console.log('has id');
      var trackEvent = player.getTrackEvent( e.target.id );
      if(!trackEvent) {
        return;
      }
      console.log('has trackEvent');

      var start = trackEvent.start;
      console.log('start : ' + start);          

      if( isValidTime(player, start )) {            
        player.currentTime( start );
      } else {
        player.trigger( 'notimeselect', trackEvent );
      }
    }
    
    var keydownHandler = function ( player, e) {
      // Get currently selected span          
      var currentSpans = this.getElementsByClassName('highlight');
       if(!currentSpans.length) {
         return;
      }
      var keyMap = {
        '40' : currentSpans[0].nextElementSibling,    // down                
        '38' : currentSpans[0].previousElementSibling // up
      }
                 
      var nextSpan = keyMap[ e.keyCode ],    
          nextTrack = nextSpan && nextSpan.id && player.getTrackEvent(nextSpan.id);  
      
       
      if( nextTrack ) {
        var start = nextTrack.start;

        if( !isValidTime( player, start )) {            
          player.trigger( 'notimeselect', nextTrack );
        } else {
          player.currentTime(nextTrack.start);
        }       
      }
    }
    
    var isValidTime = function (player, time) {
      return !(time < 0 || time > player.duration() );
    }
            
    return {
      _setup : function ( options ) {
        if ( !options.target ) { 
          throw new Error('target is not defined');
          return;
        }
        
        if( containers[ options.target ] ) {
          return;
        }
        
        var self = this,
            containerId = options.target,
            container = document.getElementById( containerId );
            
        // Gives keyboard focus
        if ( container.tabIndex === -1 ) {
          container.tabIndex = 10;
        }

        if ( options.url ) {
          // TODO - load subtitle 
        } else {
          parseSpan( this, container, options);
        }               

        var _clickHandler = clickHandler.bind(container, self),
            _keydownHandler = keydownHandler.bind(container, self);

        container.addEventListener('click', _clickHandler, false);      
        container.addEventListener('keydown', _keydownHandler, false );
        
        // register container with teardown callback
        containers[ containerId ] = function () {
          container.removeEventListener('click', _clickHandler, false);     
          container.removeEventListener('keyup', _keydownHandler, false );
        }
      },
      _teardown : function ( options ) {
        var containerId = options.target && options.target.id;
        if( container[ containerId ] ) {
          containers[ containerId ].call();
          delete containers[ containerId ];
        }               
      },
      start : function (event, options) {
        console.log('-----------------start-----------------');
        var elem = document.getElementById( options._id );
        elem && elem.classList.add( 'highlight' );
        this.trigger( 'trackchange', options );              
      },
      end : function ( event, options ) {
        console.log('-----------------end-----------------');
        var elem = document.getElementById( options._id);
        elem && elem.classList.remove( 'highlight' );
      }     
    };
  })());        
})(Popcorn);
