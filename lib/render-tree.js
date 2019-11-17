const constructRenderTree = (dom, cssom) => {
  return constructTree(dom.children[0], cssom, cssom);
};

const constructTree = (domNode, cssom, childCssom = {}) => {
  domNode.rules = Object.assign(
    {},
    domNode.rules,
    findRules(domNode, cssom, childCssom)
  );

  domNode.children.forEach(child => {
    constructTree(
      child,
      cssom,
      childCssom.children ? childCssom.children[child.type] : {}
    );
  });

  return domNode;
};

const findRules = (dom, cssom, childCssom = {}) => {
  if (dom.type === "body") {
    return cssom.rules;
  } else {
    let rules = Object.assign({}, cssom.children[dom.type] || {}).rules;

    if (childCssom.rules) {
      rules = Object.assign({}, rules, childCssom.rules);
    }

    return Object.assign({}, cssom.rules, rules);
  }
};

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
console.log(constructRenderTree(dom, css));
