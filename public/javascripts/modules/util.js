define(function(){
  var U = {
    templates: {}
  };
  U.precompileTemplates = function(){
    var templates = { };
    $("script[type='text/template']").each(function() {
      templates[this.id] = _.template($(this).html());
    });
    console.log('set templates');
    U.templates = templates;
  };
  
  // U.ItemBaseView = Backbone.View.extend({
  //   tagName : 'li',
  //   initialize : function( options ) {
  //     this.template = U.templates[this.template];
  //   },
  //   render : function() {
  //     this.$el.html(
  //       this.template({
  //         model : this.model.toJSON()
  //       })
  //     );
  //     //.attr('data-model-cid', this.model.cid);//.attr('id', this.model.cid );        
  //     return this;
  //   }
  // });
  
  
  return U;
});