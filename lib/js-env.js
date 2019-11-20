(function(window) {
  let globalScope = Object.create(null);

  const run = (code, myDocument) => {
    globalScope.document = myDocument;
    globalScope = Object.assign(globalScope, window.browserApi);
    jsParser.run(code, globalScope);
  };

  window.jsenv = {
    run
  };
})(window);
