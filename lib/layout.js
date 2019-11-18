(function(window) {
  const locate = (renderTree) => {

  }

  window.myLayout = {
    locate
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
    </body>
  </html>
`);

const css = myCss.parse(`
  body {
    color: yellow;
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
  }
`);

console.log(renderTree.constructRenderTree(dom, css));
