const constructRenderTree = (dom, cssom) => {
  console.log(dom, css);
};

const dom = myDom.parse(`<html>
    <body>
      <div class="first">
      </div>
      <div class="second">
      </div>
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
`);

constructRenderTree(dom, css);
