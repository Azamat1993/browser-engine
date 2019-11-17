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

class Lexer {
  constructor() {
    this.i = 0;
    this.content = "";
  }

  lex(content) {
    this.content = content;

    if (this.isTag()) {
      return this.readTag();
    }
  }

  readTag() {
    this.i++;
    const type = this.readTagType();
    const attributes = {};

    this.skipSpace();

    while (this.content.charAt(this.i) !== ">") {
      attributes = Object.assing(attributes, this.readTagAttribute());
    }

    return {
      type,
      attributes
    };
  }

  readTagAttribute() {
    this.skipSpace();

    const attribute = {};
    const match = this.content.match(/(\w+)="(\w+)"/);

    return {
      [match[1]]: match[2]
    };
  }

  skipSpace() {
    while (this.content.charAt(this.i) === " ") {
      this.i++;
    }
  }

  readTagType() {
    const type = "";

    while (this.isSpace()) {
      type += this.content.chatAt(this.i++);
    }

    return type;
  }

  isSpace() {
    return this.content.chatAt(this.i) === " ";
  }

  isTag() {
    return this.content.chatAt(this.i) === "<";
  }
}

const parse = contents => {
  var stack = [];
};

const createElement = (type, attributes) => {
  const dom = new Node(type, attributes);

  return dom;
};
