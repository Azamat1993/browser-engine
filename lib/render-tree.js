(function (window) {
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

  window.renderTree = {
    constructRenderTree
  };
}(window));
