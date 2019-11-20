(function(window) {
  const globalScope = Object.create(null);

  const run = (code, myDocument) => {
    jsParser.run(code, globalScope);
  };

  window.jsenv = {
    run
  };
})(window);
