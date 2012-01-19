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

// senario
// 1. load transcript file: row or url, container and file is needed
// 2. load by container( or id), split by span with data-start and data-end
// 3. insert by target(or id)
// should I remove container trackEvent? which is automatically asigned
(function(Popcorn){
	Popcorn.plugin('transcript', (function(){
	  
		var self = this;

		function selectById(id) {
			var elem = document.getElementById(id);
			elem && elem.classList.add('editing');
		}
		
		function deselectById (id) {
			var elem = document.getElementById(id);
			elem && elem.classList.remove('editing');
		}

 
		return {
			_setup : function (options) {
				console.log('========_setup=======');				 
				if(!options.target && !options.container) {
					throw new Error('target is not defined');
					return;
				}
				var self = this,
					containerStr = options.container,
					container = document.getElementById(containerStr),
					spans = container.getElementsByTagName('span');
					
				// Gives keyboard focus
				console.log('container.tabIndex : ' + container.tabIndex);				
				container.tabIndex = 10;

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
  				  container: containerStr,
  				  effect : [],
  				  target : false,
  				  _natives : options._natives
  				});
				});
				
				// Delegate event to span element
				container.addEventListener('click', function (e) {
				  console.log('clicked');
				  if( e.target.tagName !== 'SPAN' || !e.target.id) {
				    return;
				  }
				  console.log('has id');
				  var trackEvent = Popcorn.getTrackEvent.ref(self, e.target.id);
				  if(!trackEvent) {
				    return;
				  }
				  console.log('has trackEvent');
				  
				  var start = trackEvent.start;
				  console.log('start : ' + start);				  
				  self.currentTime(start);				  	  
				  // TODO - make sure select clicked span which has invalid start time
				  //selectById(trackEvent._id);
				  // if(start === -1) {
				  //            self.trigger('trackstart', 
				  //              Popcorn.extend({}, trackEvent, {
				  //                 plugin: 'transcript',
				  //                 type: 'trackstart'
				  //               })
				  //             );
				  //          }
				  
				  
				}, false);
				
				container.addEventListener('keydown', function (e) {
				  // Get currently selected span          
				  var currentSpans = this.getElementsByClassName('editing');
          if(!currentSpans.length) {
            return;
          }          
          var nextSpan = {
              '40' : currentSpans[0].nextElementSibling,    // down                
              '38' : currentSpans[0].previousElementSibling
          }[e.keyCode];
          if(!nextSpan || !nextSpan.id) {
            return;
          }          
          var nextTrack = self.getTrackEvent(nextSpan.id);   
          if( nextTrack ) {              
            self.currentTime(nextTrack.start);
            
            // Make sure nextSpan select in case start time is invalid.
            // selectById(nextSpan.id);
          }          
				}, false);									 
			},
			_teardown	: function () {
			  // TODO - remove Events
			  
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
        container : 'text-container'   
    });
    
    // youtube.listen('trackstart', function (e) {
    //   console.log('trackstart');      
    //   //var text = $('#' + e._id).text();
    //   //$('#text-input').val(text);      
    // });
    // 
    youtube.listen('trackend', function (e) {
      console.log('trackend');
			// TODO - make sure if there is no running track for span,
			$('#text-input').val('');
    }); 
    youtube.listen('trackchange', function (e) {
      console.log('trackchange');
      $('#text-input').val($('#'+ e._id).text());
      $('#time-input-start').val(e.start);
			$('#time-input-end').val(e.end);
    });

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

