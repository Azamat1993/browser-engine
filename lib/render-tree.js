const constructRenderTree = (dom, cssom) => {
  return constructTree(dom, cssom);
};

const constructTree = (domNode, cssom) => {
  domNode.rules = findRules(domNode, cssom);

  domNode.children.forEach(child => constructTree(child, cssom));

  return domNode;
};

const findRules = (dom, cssom, specificStyles = {}) => {
  if (dom.type === "body") {
    return cssom.rules;
  } else {
    const child = cssom.children[dom.type] || {};

    return Object.assign({}, cssom.rules, child.rules);
  }
};

const dom = myDom.parse(`<html>
    <body>
      <div class="first">
        <span></span>
      </div>
      <div class="second">
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

  span {
    color: orange;
  }
`);

console.log(constructRenderTree(dom, css));
