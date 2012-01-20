require.config({
    'baseUrl' : '/javascripts'
  , 'paths' : {
        'jQuery' : 'libs/jquery/main'
      , 'underscore' : 'libs/underscore/underscore-min'
      , 'backbone' : 'libs/backbone/main'
      , 'popcorn' : 'libs/popcorn/main'
    }
});
// make real time?
// TODO - and then build glue and sissor tool
// TODO - and then make them work with popcorn


// TODO - select span when youtube slider is moving, ask.
// TODO - make time-input correct using Popcorn util
// TODO - use effect? 
// TODO - make this plugin becasuse onStart and onEnd isn't necessary with each trackEvent 
//if I make this plugin removing jquery, ...

require(['jQuery', 'underscore', 'backbone', 'popcorn'], function ($, _, Backbone, Popcorn) {
console.log('loaded');


// TODO - should be able to parse subtitle format.
// TODO - should be able to parse span with data-start, data-end
// TODO - pollyfill for dataset nad classList
// TODO - currently only span element
// TODO - auto scroll
// TODO - add option which enable cue beforehand, something like currentTime(start - option.***)
// TODO - add option like withEditor?

// senario
// 1. load transcript file: row or url, container and file is needed
// 2. load by container( or id), split by span with data-start and data-end
// 3. insert by target(or id)
// should I remove container trackEvent? which is automatically asigned
(function(Popcorn){
	Popcorn.plugin('transcript', (function(){
	  
		// Register container by id. value is just 1
		// Allow more than one transcript container
		var containers = { };

		function registerContainer(options) {
			var self = this,
					containerStr = options.target,
					container = document.getElementById(containerStr),
					spans = container.getElementsByTagName('span');
					container.setAttribute('data-id', options._id);					
			
			
			// Gives keyboard focus
			if(container.tabIndex === -1) {
				container.tabIndex = 10;
			}
			
			// 
			Popcorn.forEach(spans , function (span, index) {				  
				var id = span.id = Popcorn.guid('transcript'),
            start = span.getAttribute('data-start'),
				    end = span.getAttribute('data-end');

 				Popcorn.addTrackEvent(self, {
 					start : start || -1,
 				  end : end || -1,
 				  id : id,
 				  _running : false,
 				  compose : [],
 				  effect : [],
					target : containerStr,
 				  _natives : options._natives
 				});
			});
			
			var _clickHandler = clickHandler.bind(container, this),
					_keydownHandler = keydownHandler.bind(container, this);
			
			container.addEventListener('click', _clickHandler, false);			
			container.addEventListener('keydown', _keydownHandler, false);
			// register container
			containers[options._id] = function () {
				container.removeEventListener('click', _clickHandler, false);			
				container.removeEventListener('keydown', _keydownHandler, false);
			}
		}
		
		// Delegate event to span element
		function clickHandler(player, e) {
			console.log('clicked');
		  if( e.target.tagName !== 'SPAN' || !e.target.id) {
		    return;
		  }
		  console.log('has id');
		  var trackEvent = player.getTrackEvent(e.target.id);//Popcorn.getTrackEvent.ref(player, e.target.id);
		  if(!trackEvent) {
		    return;
		  }
		  console.log('has trackEvent');

		  var start = trackEvent.start;
		  console.log('start : ' + start);				  

			if(isValidTime(player, start)) {						
				player.currentTime(start);
			} else {
				player.trigger('notimeselect', trackEvent );
			}
		}
		
		function keydownHandler(player, e) {
			// Get currently selected span          
		  var currentSpans = this.getElementsByClassName('editing');
       if(!currentSpans.length) {
         return;
       }          
       var nextSpan = {
           '40' : currentSpans[0].nextElementSibling,    // down                
           '38' : currentSpans[0].previousElementSibling // up
       }[e.keyCode];

       if(!nextSpan || !nextSpan.id) {
         return;
       }          
       var nextTrack = player.getTrackEvent(nextSpan.id);   
       if( nextTrack ) {
        var start = nextTrack.start;

				if(!isValidTime(player, start)) {						
					player.trigger('notimeselect', nextTrack );
				} else {
					player.currentTime(nextTrack.start);
				}       
       }
		}
		
		function selectById(id) {
			var elem = document.getElementById(id);
			elem && elem.classList.add('editing');
		}
		
		function deselectById (id) {
			var elem = document.getElementById(id);
			elem && elem.classList.remove('editing');
		}
		
		function isValidTime(player, time) {
			return !(time < 0 || time > player.duration() );
		}
						
		return {
			_setup : function (options) {
				console.log('========_setup=======');				 
				if(!options.target ) { // && !options.container) {
					throw new Error('target is not defined');
					return;
				}
								
				if(!containers[options._id]) {
					// Remove trackEvent of container
					// this.removeTrackEvent(options._id);
					registerContainer.call(this, options);
				}				
			},
			_teardown	: function (options) {
				container[options._id].call();
			  delete container[options._id];
			},
			start : function (event, options) {
				console.log('-----------------start-----------------');
				selectById(options._id);
				this.trigger('trackchange', options);							 
			},
			end : function (event, options) {
				console.log('-----------------end-----------------');
				deselectById(options._id);
			}			
		};
	})());			  
})(Popcorn);





$(document).ready(function () {
    
    Popcorn.plugin.debug = true;
    var youtube = Popcorn.youtube( '#video', 'http://www.youtube.com/watch?v=CxvgCLgwdNk' );  
    youtube.transcript({
        //container : 'text-container'   
			target : 'text-container'
    });
    
    youtube.listen('trackend', function (e) {
      console.log('trackend');
			// TODO - make sure if there is no running track for span,
			$('#text-input').val('');
			currentTrack = undefined;
    }); 
		var callbacks = [ ],
				currentTrack;
		
		
    youtube.listen('trackchange', function (e) {
      console.log('trackchange');
			fillInputs(e);
			currentTrack = e;			
    });
		
		youtube.listen('notimeselect', function (e) {			
			console.log('notimeselect');			
			fillInputs(e);
			currentTrack = e;
			$('#'+ e._id).addClass('editing');
			callbacks.push(function () {
				$('#'+e._id).removeClass('editing');
				currentTrack = undefined;
			});
		});
		
		function fillInputs(e) {
			while(callbacks.length) {
				var fn = callbacks.shift();
				fn();
			}
			$('#text-input').val($('#'+ e._id).text());
      $('#time-input-start').val(e.start);
			$('#time-input-end').val(e.end);
		}
		
		$('#text-input').on('focusin', function (e) {
        console.log('focusin');
				// find currently selected span
				
        $(this).on('keyup', updateText);
    });
    
    $('#text-input').on('focusout', function (e) {
        console.log('focusout');
        $(this).off('keyup', updateText);
    });
    
    function updateText(e) {
			if(currentTrack) {
				var id = currentTrack._id;
				$('#' + id).text($('#text-input').val());
			} else {
				var val = $('#text-input').val();
        if(val === '') {
        	return;
        }				
				currentTrack = insertSpan(val);
      }
    }
		
		// retern trackEvent
		function insertSpan(val) {
			var id = Popcorn.guid('transcript'),
					text = '<span id=' + id + '>' + val + '</span>',
					start = $('#time-input-start').val(),
					end = $('#time-input-end').val();					
			
			(start === '') && (start = -1);
			(end === '') && (end = -1);
			
			youtube.transcript({
				start : start,
				end : end,
				id : id,
				_running : false,
				target : 'text-container'
				
	//			_natives : youtube.transcript
			});
			// Popcorn.addTrackEvent(self, {
			// 		start : start || -1,
			// 	  end : end || -1,
			// 	  id : id,
			// 	  _running : false,
			// 	  compose : [],
			// 	  container: containerStr,
			// 	  effect : [],
			// 	  target : false,
			// 	  _natives : options._natives
			// 	});
			$('#text-container').append(text);
			return youtube.getTrackEvent(id);
		}


    youtube.listen('playing', function (e) {
        console.log('playing');
    });
    
    youtube.listen('play', function (e) {
        console.log('play');
    });
    
    youtube.listen('waiting', function (e) {
        console.log('wating');
    });
    youtube.listen('abort', function (e) {
        console.log('abort');
    });
    
    youtube.listen('ratechange', function (e) {
        console.log('ratechange');        
    });

    youtube.listen('ended', function (e) {
        console.log('ended');
    });
    
    youtube.listen('seeked', function (e) {
         console.log('----seeked----');
    });
     
    youtube.listen('seeking', function (e) {
         console.log('++++seeking++++');
    });
     
    youtube.play();
    
    // for easy debug
    window.youtube = youtube;
    window.$ = $;
    // $('#ajust').on('click', function (e) {
    //        
    //    });
        
        
});// document ready
});

