(function(window) {
  const DEFAULT_RULES = {
    color: "black",
    position: "relative",
    background: "black",
    display: "block",
    width: '100%',
    height: '100%',
    top: 0,
    left: 0
  };

  const CASCADE_RULES = ['color'];

  class Rules {
    constructor(rules) {
      this.store = {};

      this.setRules(rules);
    }

    setRules(rules, importance = 0) {
      Object.keys(rules).forEach(ruleKey => {
        if (
          (this.store[ruleKey] &&
            this.store[ruleKey].importance < importance) ||
          !this.store[ruleKey]
        ) {
          this.setRule(ruleKey, rules[ruleKey], importance);
        }
      });

      return this;
    }

    setRule(key, value, importance) {
      this.store[key] = {
        value,
        importance
      };
    }

    getRules() {
      const res = {};

      Object.keys(this.store).forEach(key => {
        res[key] = this.store[key].value;
      });

      return res;
    }
  }

  class Node {
    constructor(type, rules, importance, children) {
      this.type = type;
      this.rulesController = new Rules(Object.assign({}, DEFAULT_RULES, rules));
      this.rules = this.rulesController.getRules();
      this.children = children || {};
    }

    setRules(newRules, importance) {
      this.rules = this.rulesController
        .setRules(newRules, importance)
        .getRules();
    }

    getRules() {
      return this.rules;
    }

    getCascadeRules() {
      const cascadeRules = {};

      Object.keys(this.getRules()).filter(this.isCascadeRule).forEach(key => {
        cascadeRules[key] = this.getRules()[key];
      });

      return cascadeRules;
    }

    isCascadeRule(ruleKey) {
      return CASCADE_RULES.indexOf(ruleKey) !== -1;
    }

    updateRules(rootRules = this.rulesController) {
      if (rootRules !== this.rulesController) {
        const store = this.rulesController.store;
        const rootStore = rootRules.store;
        Object.keys(rootRules.store).filter(this.isCascadeRule).forEach(key => {
          if (store[key].importance < rootStore[key].importance) {
            this.rulesController.store[key] = Object.assign({}, rootStore[key]);
          }
        });
      }

      Object.keys(this.children).forEach(childKey => {
        this.children[childKey].updateRules(this.rulesController);
      });

      this.rules = this.rulesController.getRules();
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

      this.root.updateRules();

      return this.root;
    }

    setRules() {
      let root = this.root;
      let importance = 0;

      while (!this.isOpeningRules()) {
        const selector = this.readSelector();

        if (selector === this.root.type) {
          root = this.root;
        } else {
          if (!root.children[selector]) {
            root.children[selector] = new Node(selector, root.getCascadeRules());
          }

          root = root.children[selector];
        }

        importance++;

        this.skipSpace();
      }

      root.setRules(this.readRules(), importance);

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

  window.myCss = {
    parse
  };
})(window);
