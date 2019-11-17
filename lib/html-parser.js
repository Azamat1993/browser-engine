(function(window) {
  class Node {
    constructor(type, attributes, parent, children) {
      this.type = type;
      this.attributes = attributes || {};
      this.children = children || [];
      this.parent = null;
    }

    appendChild(childElement) {
      this.children.push(childElement);
    }
  }

  class Stack extends Array {
    peek() {
      return this[this.length - 1];
    }
  }

  class Parser {
    constructor() {
      this.i = 0;
      this.content = "";
      this.root = null;
      this.stack = new Stack();
    }

    parse(content) {
      this.content = content;

      while (this.isTag()) {
        this.skipSpace();
        if (this.isClosingTag()) {
          this.readClosingTag();
        } else {
          this.readOpeningTag();
        }
        this.skipSpace();
      }

      return this.root;
    }

    readOpeningTag() {
      const parent = this.stack.peek();
      const tag = this.readTag();

      if (parent) {
        parent.appendChild(tag);
        tag.parent = parent;
      } else {
        this.root = tag;
      }

      this.stack.push(tag);
    }

    isClosingTag() {
      if (this.isTag()) {
        return this.content.charAt(this.i + 1) === "/";
      }
      return false;
    }

    readClosingTag() {
      this.i += 2;
      const type = this.readTagType();
      // skipping closing >
      this.i++;

      const root = this.stack.peek();

      if (root.type !== type) {
        throw new SyntaxError(`closing tag ${type} doesnt match ${root.type}`);
      }

      this.stack.pop();

      return type;
    }

    readTag() {
      this.i++;
      let type = this.readTagType();
      let attributes = {};

      this.skipSpace();

      while (this.content.charAt(this.i) !== ">") {
        attributes = Object.assign(attributes, this.readTagAttribute());
      }

      // skipping closing >
      this.i++;

      return new Node(type, attributes);
    }

    readTagAttribute() {
      this.skipSpace();

      const name = this.readTagAttributeName();
      // skipping = sign
      this.i++;
      const value = this.readTagAttributeValue();

      if (name && value) {
        return {
          [name]: value
        };
      }
      return {};
    }

    readTagAttributeName() {
      let name = "";
      while (this.content.charAt(this.i) !== "=") {
        name += this.content.charAt(this.i++);
      }
      return name;
    }

    readTagAttributeValue() {
      let value = "";

      if (this.content.charAt(this.i) === '"') {
        this.i++;

        while (this.content.charAt(this.i) !== '"') {
          value += this.content.charAt(this.i++);
        }
        // skipping closing "
        this.i++;

        return value;
      } else {
        return value;
      }
    }

    skipSpace() {
      while (this.isSpace()) {
        this.i++;
      }
    }

    readTagType() {
      let type = "";

      while (!this.isSpace() && !this.isTagEnd()) {
        type += this.content.charAt(this.i++);
      }

      return type;
    }

    isSpace() {
      return (
        this.content.charAt(this.i) === " " ||
        this.content.charAt(this.i) === "\n"
      );
    }

    isTag() {
      return this.content.charAt(this.i) === "<";
    }

    isTagEnd() {
      return this.content.charAt(this.i) === ">";
    }
  }

  const parse = content => {
    const parser = new Parser();

    return parser.parse(content);
  };

  window.myDom = {
    parse
  };
})(window);
