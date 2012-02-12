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
  
  U.getJSON = function(models) {
    if(!_.isArray(models)) {
      var ret = models.toJSON();
      ret.cid = models.cid;
      return ret;  
    } 
    return models.map(function(model) {
      return U.getJSON(model);
    });    
  }
  
  U.toJSONArray = function(model) {
    var ret = U.getJSON(model);
    _.isArray(ret) || (ret = [ret]);
    return ret;
  }
  
  
  
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