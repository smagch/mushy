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
$(document).ready(function () {
    
    var $editingSpan;

    $('#text-input').on('keydown', function (e) {
        console.log('keydown');
        var val = $(this).val();
        if(e.keyCode === 13 && val.length ) {
            console.log('enter');            
            if($editingSpan) {
                endSelectSpan();
            } else {
                //var text = '<span>' + val + '</span>';
                //$('#text-container').append(text);
            }            
            $(this).val('');
            e.stopPropagation();
        }        
    });
    $('#text-input').on('focusin', function (e) {
        console.log('focusin');
        $(this).on('keyup', updateText);
    });
    
    $('#text-input').on('focusout', function (e) {
        console.log('focusout');
        $(this).off('keyup', updateText);
    });
    
    function updateText(e) {
        if(!$editingSpan) {
            var val = $(this).val();
            if(val === '') {
                return;
            }
            var text = '<span>' + val + '</span>';
            //$editingSpan = $(text).appendTo('#text-container');
            selectSpan.call($(text).appendTo('#text-container'));
            return;
            //$('#text-container').append(text);            
        }
        $editingSpan.text($(this).val());
    }

    $('#text-container').on('click', 'span', function (e) {
        selectSpan.call(this);
        youtube.pause();
        e.stopPropagation();
    });
    
    // cursor reset functions
    $(document).on('mouseup', function (e) {
        function isReset(target) {                                    
            if(!$(target).is('input') && !$(target).parents('#video').length) {
                return true;
            }
            return false;
        }
        
        if( $editingSpan && isReset(e.target)) {            
            console.log('document click');        
            endSelectSpan();
        }
        e.stopPropagation();
    });
    
    $(document).on('keydown', function (e) {
          if($editingSpan) {
              var map = {
                  '40' : $editingSpan.next()// down
                , '38' : $editingSpan.prev()// up                
              }        
              var next = map[e.keyCode];
              if(next && next.length) {
                  endSelectSpan();
                  selectSpan.call(next);
              }              
          }
    });
    
    // this span
    function selectSpan() {
        $editingSpan = $(this);
        $('#text-input').focus().val(          
          $(this)
            .addClass('editing')            
            .text()
        );
        var start = $editingSpan.attr('data-start')
          , end = $editingSpan.attr('data-end')
          ;
        $('#time-input-start').val(start);
        $('#time-input-end').val(end);
        
        var id = $editingSpan.attr('data-id');
        if(youtube.getTrackEvent(id)) {
            youtube.currentTime(start);
        }        
    }
    // this span
    function deselectSpan() {
        if($editingSpan) {
            $editingSpan.removeClass('editing');
            $editingSpan = undefined;
        } else {
            console.log('$editingSpan is null');
        }
 
        $('#time-input-start').val('');
        $('#time-input-end').val('');
        $('#text-input').val('');
    }
    
    
    // update start, end, text and then deselect
    function endSelectSpan() {           
        if(!$editingSpan) {
            throw new Error('editingSpan should be exist');
            return;
        }
        var start = $('#time-input-start').val()
          , end = $('#time-input-end').val()
          , text = $('#text-input').val()
          , id = $editingSpan
              .attr('data-start', start)
              .attr('data-end', end)
              .attr('data-id')
          ;
        
        $editingSpan.text(text);
        var trackObj = youtube.getTrackEvent(id);
        if(trackObj) {
            trackObj.start = start;
            trackObj.end = end;
        } else {
            console.log('trackObj is null');
        }
        
        
        deselectSpan();
    }
    
    var youtube = Popcorn.youtube( '#video', 'http://www.youtube.com/watch?v=CxvgCLgwdNk' );   
    $('#text-container > span[data-start][data-end]').each(function (index, el) {
        console.log('index : ' + index);
        var $el = $(el)
          , start = $el.attr('data-start')
          , end = $el.attr('data-end')
          ;
      
        var id = Popcorn.guid();
        $el.attr('data-id', id);
        
        youtube.code({
            start : start
          , end : end
          , id : id
          , onStart : function (options) {
                //console.log('onstart');                
                //selectSpan.call(el);
                var elem = $('#text-container > span[data-id=' + this._id + ']')[0]
                selectSpan.call(elem);
            }
          , onEnd : function (options) {
                //console.log('onend');
                deselectSpan();
            }
        });
        
 
        // youtube.listen('trackend', function (e) {
        //            console.log('trackend');
        //            
        //        });
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

