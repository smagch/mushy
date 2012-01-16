define(['order!libs/jquery/jquery-1.7.min', 'order!underscore', 'order!libs/backbone/backbone'], function (hoge, foo, bar) {
  console.log('loaded bakcbone');
  return window.Backbone.noConflict();
});