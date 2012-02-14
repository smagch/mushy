define(function(){
  var U = {
    templates: {}
  };
  U.precompileTemplates = function(){
    var templates = { };
    $("script[type='text/template']").each(function() {
      templates[this.id] = _.template($(this).html());
    });
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
  };
  
  U.toJSONArray = function(model) {
    var ret = U.getJSON(model);
    if(!_.isArray(ret)) {
      (ret = [ret]);
    }
    return ret;
  };
  
  return U;
});