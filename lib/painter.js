(function(window) {
  class Painter {
    constructor(paintService) {
      this.paintService = paintService;
    }

    paint(renderTree) {
      this.paintService.paint(renderTree);

      for (let childNode of renderTree.children) {
        this.paint(childNode);
      }
    }
  }

  const paint = (renderTree, paintService) => {
    const painter = new Painter(paintService);
    return painter.paint(renderTree);
  };

  window.myPainter = {
    paint
  };
})(window);
