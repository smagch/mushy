define(function(){
  var U = {
    templates: {}
  };
  U.precompileTemplates = function(){
    var templates = { };
    $("script[type='text/template']").each(function() {
      templates[this.id] = Handlebars.compile($(this).html());
    });
    Handlebars.registerHelper('renderArticle', function(context) {
      var key = context.type + '-article-template',
        template = templates[key];
      
      if(template) {
        return template(context);
      }
      return template['unknown-template'](context);
    });
    
    Handlebars.registerHelper('markdown', function(text) {
      return marked(_.escape(text));
    });
    
    Handlebars.registerHelper('embedYoutube', function(context) {
      var id = context.cid,
        divId = 'yt' + id,
        params2 = {
          allowScriptAccess: "always"
        },
        attrs = {
          id: ("youtube-" + id),
          align: 'center'
        },
        flashVars = {
          enablejsapi : 1,
          playerapiid : attrs.id,
          version : 3
        };
        
      _.defer(function() {
        swfobject.embedSWF('http://www.youtube.com/v/'+ context.id, divId, "425", "356", "8", null, flashVars, params2, attrs);
      });
      
      return '<div id=' + divId + '></div>';
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