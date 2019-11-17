class Node {
  constructor(type, attributes, children) {
    this.type = type;
    this.attributes = attributes || {};
    this.children = children || [];
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

class Lexer {
  constructor(content) {
    this.i = 0;
    this.content = content;
    this.stack = new Stack();
  }

  lex() {
    let root = null;

    while (this.isTag()) {
      const parent = this.stack.peek();
      const tag = this.readTag();

      if (parent) {
        parent.children.push(tag);
      } else {
        root = tag;
      }

      this.stack.push(tag);
    }

    return root;
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

    return {
      type,
      attributes,
      children: []
    };
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
    while (this.content.charAt(this.i) === " ") {
      this.i++;
    }
  }

  readTagType() {
    let type = "";

    while (!this.isSpace() && !this.isClosingTag()) {
      type += this.content.charAt(this.i++);
    }

    return type;
  }

  isSpace() {
    return this.content.charAt(this.i) === " ";
  }

  isTag() {
    console.log(this.i);
    return this.content.charAt(this.i) === "<";
  }

  isClosingTag() {
    return this.content.charAt(this.i) === ">";
  }
}

const parse = contents => {
  var stack = [];
};

const createElement = (type, attributes) => {
  const dom = new Node(type, attributes);

  return dom;
};

const lexer = new Lexer(
  '<html name="asd" second="sadf"><div class="as"><span class="third">'
);

console.log(lexer.lex());
