require.config({
    'baseUrl' : '/javascripts'
  , 'paths' : {
        'jQuery' : 'libs/jquery/main'
      , 'underscore' : 'libs/underscore/underscore-min'
      , 'backbone' : 'libs/backbone/main'
      , 'popcorn' : 'libs/popcorn/main'
    }
});
// TODO 1. build just output text ui 
// TODO 2. and then build make them span tool
// TODO 3. and then build glue and sissor tool
// TODO 4. and then make them work with popcorn
// TODO 5. build slider and so on
require(['jQuery', 'underscore', 'backbone', 'popcorn'], function ($, _, Backbone, Popcorn) {
console.log('loaded');
$(document).ready(function () {
    
    var $editingSpan;
    
    $('#text-input').on('keydown', function (e) {
        console.log('keydown');
        if(e.keyCode === 13) {
            console.log('enter');            
            if($editingSpan) {
                $editingSpan
                  .removeClass('editing')
                  .text($(this).val());
                $editingSpan = undefined;
            } else {
                var text = '<span>' + $(this).val() + '</span>';
                $('#text-container').append(text);
            }            
            $(this).val('');            
        }
    });         
    /// how to deal with 
    $('#text-container').on('click', 'span', function (e) {        
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
        
        
});// document ready
});

