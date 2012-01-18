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
// TODO 3. and then build glue and sissor tool
// TODO 4. and then make them work with popcorn
// TODO 5. build slider and so on
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
                var text = '<span>' + val + '</span>';
                $('#text-container').append(text);
            }            
            $(this).val('');
            e.stopPropagation();
        }        
    });         
    /// how to deal with 
    $('#text-container').on('click', 'span', function (e) {
        selectSpan.call(this);
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
        // if(start !=) {
        //             youtube.currentTime(start);
        //         }
        
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
      
        // youtube.footnote({
        //            start : start
        //          , end : end
        //          , text : $el.text()
        //          , target : 'footnote'
        //        })
        var id = Math.random().toString(16).substr(2);
        $el.attr('data-id', id);
        
        youtube.code({
            start : start
          , end : end
          , id : id
          , onStart : function (options) {
                console.log('onstart');                
                //selectSpan.call(el);
                var elem = $('#text-container > span[data-id=' + this._id + ']')[0]
                selectSpan.call(elem);
            }
          , onEnd : function (options) {
                console.log('onend');
                deselectSpan();
            }
        });
        
        
        // youtube.listen('trackend', function (e) {
        //            console.log('trackend');
        //            
        //        });
    });
    
    youtube.play();
    window.youtube = youtube;
    window.$ = $;
    // $('#ajust').on('click', function (e) {
    //        
    //    });
        
        
});// document ready
});

