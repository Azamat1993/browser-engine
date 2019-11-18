(function(window) { 
    class Painter {
        constructor(canvas) {
            this.canvas = canvas;
        }

        paint(renderTree) {
            console.log(renderTree);
        }
    }

    const paint = (renderTree, canvas) => {
        const painter = new Painter(canvas);

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
      <span></span>
      <p>
        <ul></ul>
      </p>
      <img></img>
      <span></span>
    </body>
  </html>
`);

const css = myCss.parse(`
  body {
    color: yellow;
    width: 50%;
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

  p {
    width: 15%;
  }

  p ul {

  }

  img {
    height: 2000px;
  }
`);

const root = document.getElementById('root');
const rootStyle = getComputedStyle(root);

const layout = myLayout.locate(renderTree.constructRenderTree(dom, css), new myLayout.Dimension(
    rootStyle.getPropertyValue('width'), 
    rootStyle.getPropertyValue('height')   
));

const canvas = document.getElementById('canvas');
canvas.width = parseInt(rootStyle.getPropertyValue('width'));
canvas.height = parseInt(rootStyle.getPropertyValue('height'));
