(function(window) {
  const LEX_STATES = {
    DATA: 'DATA',
    OPEN_TAG: 'OPEN_TAG',
    CLOSE_TAG: 'CLOSE_TAG'
  }

  const PARSER_STATES = {
    IDLE: 'IDLE',
    IN_PROGRESS: 'IN_PROGRESS',
    COMPLETED: 'COMPLETED'
  }

  class Lexer {
    constructor() {
      this.state = LEX_STATES.DATA;
      this.localIndex = 0;
      this.lexes = [];
      this.content = '';
    }

    lex(content) {
      this.prepareToReadNewPiece();
      this.content = content;

      while (this.localIndex < this.content.length) {
        this.readCurrentChar();
      }
    }

    readCurrentChar() {
      switch (this.state) {
        case LEX_STATES.DATA:
          this.readCurrentData();
          break;
        case LEX_STATES.OPEN_TAG:
          break;
        case LEX_STATES.CLOSE_TAG:
          break;
      }
    }

    readCurrentData() {
      const top = this.getTopLex();

      if (!top) {
        top = {
          type: OPEN_TAG,
          name: '';
        }
      }

      while (!this.isOpenTag()) {
        top.name += this.content.charAt(this.localIndex++);
      }
    }

    isOpenTag() {
      return this.content.charAt(this.localIndex) === '<';
    }

    getTopLex() {
      return this.lexes[this.lexes.length - 1];
    }

    prepareToReadNewPiece() {
      this.localIndex = 0;
    }
  }

  class Parser {
    constructor(lexer) {
      this.lexer = lexer;
      this.state = PARSER_STATES.IDLE;
    }

    parse(pieceOfHtml) {
      this.runInProgress();

      const newLexes = this.lexer.lex(pieceOfHtml);

      if (newLexes) {
        this.parseNewLexes(newLexes);
      }
    }

    runInProgress() {
      if (!this.state === PARSER_STATES.IN_PROGRESS) {
        this.state = PARSER_STATES.IN_PROGRESS;
      }
    }

    parseNewLexes(lexes) {

    }
  }

  window.htmlParserAsync = {
    Parser
  }
}(window));
