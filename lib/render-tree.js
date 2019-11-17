const constructRenderTree = (dom, cssom) => {
  return constructTree(dom, cssom);
};

const constructTree = (domNode, cssom, childCssom = {}) => {
  domNode.rules = findRules(domNode, cssom, childCssom);

  domNode.children.forEach(child => {
    const nestedChild = cssom.children[domNode.type] || {};
    constructTree(child, cssom, nestedChild);
  });

  return domNode;
};

const findRules = (dom, cssom, childCssom) => {
  if (dom.type === "body") {
    return cssom.rules;
  } else {
    let rules = Object.assign({}, cssom.children[dom.type] || {}).rules;

    if (childCssom.children) {
      rules = Object.assign(rules, childCssom.children[dom.type] || {}).rules;
    }

    return Object.assign({}, cssom.rules, rules);
  }
};

const dom = myDom.parse(`<html>
    <body>
      <div class="first">
        <span></span>
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
