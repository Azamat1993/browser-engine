const DEFAULT_RULES = {
  color: "black",
  position: "relative",
  background: "black",
  display: "block"
};

class Node {
  constructor(type, rules, children) {
    this.type = type;
    this.rules = Object.assign({}, DEFAULT_RULES, rules);
    this.children = children || {};
  }

  setRules(rules) {
    Object.assign(this.rules, rules);
  }
}

class Parser {
  constructor() {
    this.i = 0;
    this.root = new Node("body");
  }

  parse(content) {
    this.content = content;

    this.skipSpace();

    while (this.isSelector()) {
      this.setRules();
      this.skipSpace();
    }
    return this.root;
  }

  setRules() {
    let root = this.root;

    while (!this.isOpeningRules()) {
      const selector = this.readSelector();

      if (!root.children[selector]) {
        root.children[selector] = new Node(selector);
      }

      root = root.children[selector];

      this.skipSpace();
    }

    root.setRules(this.readRules());

    return root;
  }

  readRules() {
    // skipping {
    this.i++;

    const rules = {};

    this.skipSpace();

    while (!this.isClosingRules()) {
      this.skipSpace();

      const ruleName = this.getRuleName();
      const ruleValue = this.getRuleValue();

      rules[ruleName] = ruleValue;

      this.skipSpace();
    }

    // skipping }
    this.i++;

    return rules;
  }

  getRuleName() {
    this.skipSpace();

    let ruleName = "";

    while (!this.isSpace() && this.content.charAt(this.i) !== ":") {
      ruleName += this.content.charAt(this.i++);
    }

    // skipping :
    this.i++;

    return ruleName;
  }

  getRuleValue() {
    this.skipSpace();

    let ruleValue = "";

    while (!this.isSpace() && this.content.charAt(this.i) !== ";") {
      ruleValue += this.content.charAt(this.i++);
    }

    // skipping;
    this.i++;

    return ruleValue;
  }

  readSelector() {
    let selector = "";

    while (this.isSelector()) {
      selector += this.content.charAt(this.i++);
    }

    return selector;
  }

  isSelector() {
    return this.content.charAt(this.i).match(/[\-a-zA-Z\.#]/);
  }

  isOpeningRules() {
    return this.content.charAt(this.i) === "{";
  }

  isClosingRules() {
    return this.content.charAt(this.i) === "}";
  }

  skipSpace() {
    while (this.isSpace()) {
      this.i++;
    }
  }

  isSpace() {
    return (
      this.content.charAt(this.i) === " " ||
      this.content.charAt(this.i) === "\n"
    );
  }
}

const parse = content => {
  const parser = new Parser();

  return parser.parse(content);
};

console.log(
  parse(`
  body {
    color:red;
  }
  p p {
    background: while;
  }`)
);
