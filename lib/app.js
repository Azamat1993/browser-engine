const dom = myDom.parse(`<html>
<head>
    <link href="./style.css"></link>
</head>
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
  <il></il>
  <il></il>
  <il></il>
  <il>  <img></img></il>
  <il></il>
  <il></il>
  <il></il>
  <img></img>
  <script>do(define(total, 0),
   define(count, 1),
   while(<(count, 11),
         do(define(total, +(total, count)),
            define(count, +(count, 1)))),
   print(total))</script>
  <script>do(print(total))</script>
  <script>
  do(define(plusOne, fun(a, +(a, 1))),
   print(plusOne(108)))</script>
   <script>
   do(define(plusOne, fun(a, +(a, 1))),
      setTimeout(fun(print(total)), 200))</script>
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
        height: 300px;
        width: 20%;
        background: lightgrey;
    }
    p {
        width: 50%;
    }
    il {
        width: 10%;
        height: 300px;
        background: blue;
    }
`);

class CanvasPaintService {
  constructor(canvas) {
    this.canvas = canvas;
    this.ctx = this.canvas.getContext("2d");
  }

  paint(node) {
    const { dimension, rules } = node;
    this.ctx.fillStyle = rules.background;
    this.ctx.fillRect(
      dimension.left,
      dimension.top,
      dimension.width,
      dimension.height
    );
  }
}

const root = document.getElementById("root");
const rootStyle = getComputedStyle(root);

const layout = myLayout.locate(
  renderTree.constructRenderTree(dom, css),
  new myLayout.Dimension(
    parseInt(rootStyle.getPropertyValue("width")),
    parseInt(rootStyle.getPropertyValue("height"))
  )
);

const canvas = document.getElementById("canvas");
canvas.width = parseInt(rootStyle.getPropertyValue("width"));
canvas.height = parseInt(rootStyle.getPropertyValue("height"));

myPainter.paint(layout, new CanvasPaintService(canvas));
