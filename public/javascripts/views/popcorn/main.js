

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






//$(document).ready(function () {
    
    Popcorn.plugin.debug = true;
    var youtube = Popcorn.youtube( '#video', 'http://www.youtube.com/watch?v=CxvgCLgwdNk' );  
    //var youtube = Popcorn.youtube( '#video', 'http://www.youtube.com/watch?v=drTyNDRnyxs' );  
    youtube.itranscript({
			target : 'text-container',
			//subtitle : '/subtitles/drTyNDRnyxs.srt'// url
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
			
			youtube.itranscript({
				start : start,
				end : end,
				id : id,
				_running : false,
				target : 'text-container'				
	//			_natives : youtube.transcript
			});
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
    //window.youtube = youtube;
    //window.$ = $;
    // $('#ajust').on('click', function (e) {
    //        
    //    });
        
        
//});// document ready


