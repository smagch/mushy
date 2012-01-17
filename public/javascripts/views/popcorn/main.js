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
// issue : browser tend to take two spans as one span.
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
                $editingSpan
                  .removeClass('editing')
                  .text(val);
                $editingSpan = undefined;
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
        if((e.ctrlKey || e.shiftKey) && $('text-container span.editing').length !== 0) {
            // TODO select between span.editing
          
        }      
        $editingSpan = $(this);
        $('#text-input').focus().val(          
          $(this)
            .addClass('editing')            
            .text()
        );
        

        
        e.stopPropagation();
    });
    
    // reset functions
    $(document).on('mouseup', function (e) {        
        if($editingSpan && !$(e.target).is('input') ) {
            console.log('document click');        
            $editingSpan.removeClass('editing');
            $('#text-input').val('');
            $editingSpan = undefined;
        }
        e.stopPropagation();
    });
    
    $(document).on('keydown', function (e) {
          if($editingSpan) {
              var map = {
                  '40' : $editingSpan.next()
                , '38' : $editingSpan.prev()                
              }
              // 38 up
              // 40 down
              // 39 = right cursor
              // 37 = left cursor
              var next = map[e.keyCode];
              if(next && next.length) {
                  $editingSpan.removeClass('editing');
                  $editingSpan = next.addClass('editing');
                  $('#text-input').val($editingSpan.text());
              }              
          }
    });
    
    var youtube = Popcorn.youtube( '#video', 'http://www.youtube.com/watch?v=CxvgCLgwdNk' );   
    $('#text-container > span[data-start][data-end]').each(function (index, el) {
        console.log('index : ' + index);
        var $el = $(el)
          , start = $el.data('start')
          , end = $el.data('end')
          ;
      
        youtube.footnote({
            start : start
          , end : end
          , text : $el.text()
          , target : 'footnote'
        });
        
        youtube.code({
            start : start
          , end : end
          , onStart : function (options) {
                console.log('onstart');
                $el.addClass('highlight');        
            }
          , onEnd : function (options) {
                console.log('onend');
                $el.removeClass('highlight');
            }
        });
    });
    
    youtube.play();
    // $('#ajust').on('click', function (e) {
    //        
    //    });
        
        
});// document ready
});

