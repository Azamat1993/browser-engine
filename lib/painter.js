(function(window) { 
    class Painter {
        constructor(paintService) {
            this.paintService = paintService;
        }

        paint(renderTree) {
            this.paintService.paint(renderTree);

            for(let childNode of renderTree.children) {
                this.paint(childNode);
            }
        }
    }

    const paint = (renderTree, paintService) => {
        const painter = new Painter(paintService);

        return painter.paint(renderTree);
    }

    window.myPainter = {
        paint
    }
}(window));


const dom = myDom.parse(`<html>
    <body>
      <div>
        <div>
          <div>
            <span></span>
          </div>
        </div>
      </div>
      <img></img>
      <p></p>
    </body>
  </html>
`);

const css = myCss.parse(`
  body {
    color: yellow;
    height: 100px;
  }

  div {
    background: red;
  }

  div span {
    color: purple;
  }

  div div div span {
    color: asdfasdfasdf;
  }

  div div p {
    background: asdfasdfasdfadsf;
  }

  div div {
    background: blue;
  }

  span {
    color: orange;
    width: 80%;
  }
img {
    width: 20%;
    background: yellow;
}
p {
    width: 50%;
}
`);

class CanvasPaintService {
    constructor(canvas) {
        this.canvas = canvas;
        this.ctx = this.canvas.getContext('2d');
    }

    paint(node) {
        const { dimension, rules } = node;
        this.ctx.fillStyle = rules.background;
        this.ctx.fillRect(dimension.left, dimension.top, dimension.width, dimension.height);
    }
}

const root = document.getElementById('root');
const rootStyle = getComputedStyle(root);

const layout = myLayout.locate(renderTree.constructRenderTree(dom, css), new myLayout.Dimension(
    parseInt(rootStyle.getPropertyValue('width')), 
    parseInt(rootStyle.getPropertyValue('height'))
));

const canvas = document.getElementById('canvas');
canvas.width = parseInt(rootStyle.getPropertyValue('width'));
canvas.height = parseInt(rootStyle.getPropertyValue('height'));

myPainter.paint(layout, new CanvasPaintService(canvas));
