(function(window) {
  class Dimension {
    constructor(width, height, top = 0, left = 0) {
      this.width = width;
      this.height = height;
      this.top = top;
      this.left = left;
    }
  }

  const locate = (renderNode, parentDimension) => {
    const dimension = getDimensions(renderNode, parentDimension);

    renderNode.dimension = new Dimension(
      dimension.width,
      dimension.height
    );

    for(let child of renderNode.children) {
      locate(child, renderNode.dimension);
    }

    return renderNode;
  }

  const getDimensions = (renderNode, parentDimension) => {
    const cssRules = renderNode.rules;

    const get = (metric) => {
      return getDimension(metric, cssRules, parentDimension);
    }

    return {
      width: get('width'),
      height: get('height')
    }
  }

  const getDimension = (metric, cssRules, parentDimension) => {
    const value = cssRules[metric];

    if (isPercentage(value)) {
      return getPercentage(value, parentDimension[metric]);
    } else if (isPixels(value)) {
      return getPixels(value, parentDimension[metric]);
    } else {
      return 0;
    }
  }

  const getPercentage = (value, parentValue) => {
    const percentage = value.match(/([0-9]+)/)[1];

    return (parentValue * percentage) / 100;
  }

  const getPixels = (value, parentValue) => {
    return parseInt(value, 10);
  }

  const isPercentage = (value) => {
    const val =  value.match(/%$/);
    return val;
  }

  const isPixels = value => {
    return value.match(/[0-9]+px$/);
  }

  window.myLayout = {
    locate,
    Dimension
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
  }
`);

const layout = myLayout.locate(renderTree.constructRenderTree(dom, css), new myLayout.Dimension(1800, 1800));

console.log(layout);

