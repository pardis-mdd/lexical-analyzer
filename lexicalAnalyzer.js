class Token {
  constructor(type, value, lineNumber, index, block) {
    this.type = type || "UNKNOWN";
    this.value = value;
    this.lineNumber = lineNumber || 1;
    this.index = index || 0;
    this.block = block || 0;
  }
}

class Lexer {
  constructor(input) {
    this.input = input;
    this.position = 0;
    this.currentChar = this.input[0];
    this.lineNumber = 1;
    this.lineStartIndex = 0;
    this.index = 0;
    this.blockLevel = 0; // Track the current block level
  }

  advance() {
    this.position += 1;
    this.currentChar =
      this.position < this.input.length ? this.input[this.position] : null;
  }

  isDigit(char) {
    return /\d/.test(char);
  }

  isAlpha(char) {
    return /[a-zA-Z]/.test(char);
  }

  handleParentheses() {
    const bracketType = RULES[this.currentChar] || this.currentChar;
    let bracketName;

    switch (this.currentChar) {
      case "(":
        bracketName = "LEFT_PAREN";
        break;
      case ")":
        bracketName = "RIGHT_PAREN";
        break;
      case "{":
        bracketName = "LEFT_BRACE";
        this.blockLevel += 1; // Increment block level on {
        break;
      case "}":
        bracketName = "RIGHT_BRACE";
        this.blockLevel -= 1; // Decrement block level on }
        break;
      case "[":
        bracketName = "LEFT_SQUARE_BRACKET";
        break;
      case "]":
        bracketName = "RIGHT_SQUARE_BRACKET";
        break;
      default:
        bracketName =
          RULES[`delimiter_${this.currentChar.toLowerCase()}`] || bracketType;
    }

    return new Token(
      bracketName,
      this.currentChar,
      this.lineNumber,
      this.index,
      this.blockLevel
    );
  }

  handleDelimiters() {
    const delimiterType = RULES[this.currentChar] || "DELIMITER";
    let delimiterName;

    switch (this.currentChar) {
      case ":":
        delimiterName = "Delimiter_COLON";
        break;
      case ";":
        delimiterName = "Delimiter_SEMICOLON";
        break;
      case ",":
        delimiterName = "Delimiter_COMMA";
        break;
      case ".":
        delimiterName = "Delimiter_DOT";
        break;
      default:
        delimiterName =
          RULES[`delimiter_${this.currentChar.toLowerCase()}`] || delimiterType;
    }

    return new Token(
      delimiterName,
      this.currentChar,
      this.lineNumber,
      this.index,
      this.blockLevel
    );
  }

  handleQuotes(quoteType) {
    let value = "";
    const startLineNumber = this.lineNumber;
    const startIndex = this.index;

    this.advance(); // Move past the opening quote

    while (this.currentChar !== null && this.currentChar !== quoteType) {
      value += this.currentChar;
      this.advance();
    }

    if (this.currentChar !== quoteType) {
      throw new Error(`Unterminated string at line ${startLineNumber}, index ${startIndex}`);
    }

    this.advance(); // Move past the closing quote

    return new Token(
      "STRING",
      value,
      startLineNumber,
      startIndex,
      this.blockLevel
    );
  }

  handleComments() {
    if (this.currentChar === '/' && this.input[this.position + 1] === '/') {
      // Single-line comment
      while (this.currentChar !== '\n' && this.currentChar !== null) {
        this.advance();
      }
      return null; // Ignore the comment and return null
    } else if (this.currentChar === '/' && this.input[this.position + 1] === '*') {
      // Multi-line comment
      let comment = '';
      const startLineNumber = this.lineNumber;
      const startIndex = this.index;

      this.advance(); // Move past the opening '/'
      this.advance(); // Move past the '*'

      while (!(this.currentChar === '*' && this.input[this.position + 1] === '/')) {
        if (this.currentChar === null) {
          throw new Error(`Unterminated multi-line comment at line ${startLineNumber}, index ${startIndex}`);
        }
        comment += this.currentChar;
        this.advance();
      }

      this.advance(); // Move past the '*'
      this.advance(); // Move past the '/'

      return new Token(
        "COMMENT",
        comment,
        startLineNumber,
        startIndex,
        this.blockLevel
      );
    } else {
      return null; // Not a comment
    }
  }

  tokenize() {
    const tokens = [];

    while (this.currentChar !== null) {
      if (this.currentChar === "\n") {
        tokens.push(
          new Token(
            "NEWLINE",
            "\n",
            this.lineNumber,
            this.index,
            this.blockLevel
          )
        );
        this.advance();
        this.lineNumber += 1;
        this.lineStartIndex = this.position;
      } else if (this.isDigit(this.currentChar)) {
        let number = "";
        while (
          this.currentChar !== null &&
          (this.isDigit(this.currentChar) || this.currentChar === ".")
        ) {
          number += this.currentChar;
          this.advance();
        }
        tokens.push(
          new Token(
            "NUMBER",
            parseFloat(number),
            this.lineNumber,
            this.index,
            this.blockLevel
          )
        );
      } else if (this.isAlpha(this.currentChar)) {
        let identifier = "";
        while (
          this.currentChar !== null &&
          (this.isAlpha(this.currentChar) ||
            this.isDigit(this.currentChar) ||
            this.currentChar === "_")
        ) {
          identifier += this.currentChar;
          this.advance();
        }

        const keywordType = RULES[`keyword_${identifier}`];
        tokens.push(
          new Token(
            keywordType ? "KEYWORD" : "IDENTIFIER",
            identifier,
            this.lineNumber,
            this.index,
            this.blockLevel
          )
        );

        if (this.currentChar === "=") {
          tokens.push(
            new Token(
              "OPERATOR",
              "=",
              this.lineNumber,
              this.index,
              this.blockLevel
            )
          );
          this.advance();
        }
      } else if (
        this.currentChar === "+" ||
        this.currentChar === "=" ||
        /[.:=>]/.test(this.currentChar)
      ) {
        tokens.push(
          new Token(
            "OPERATOR",
            this.currentChar,
            this.lineNumber,
            this.index,
            this.blockLevel
          )
        );
        this.advance();
      } else if (/[:;,.]/.test(this.currentChar)) {
        tokens.push(this.handleDelimiters());
        this.advance();
      } else if (/[(){}\[\]]/.test(this.currentChar)) {
        tokens.push(this.handleParentheses());
        this.advance();
      } else if (/['"]/.test(this.currentChar)) {
        tokens.push(this.handleQuotes(this.currentChar));
      } else if (/\s/.test(this.currentChar)) {
        this.advance();
      } else if (/[=!<>+\-*^~&|%]/.test(this.currentChar)) {
        tokens.push(
          new Token(
            "OPERATOR",
            this.currentChar,
            this.lineNumber,
            this.index,
            this.blockLevel
          )
        );
        this.advance();
      } else if (this.currentChar === '/' && (this.input[this.position + 1] === '/' || this.input[this.position + 1] === '*')) {
        // Handle comments
        const commentToken = this.handleComments();
        if (commentToken) {
          tokens.push(commentToken);
        }
      } else {
        throw new Error(`Unknown character: ${this.currentChar}`);
      }

      if (!/\s/.test(this.currentChar)) {
        this.index = this.position - this.lineStartIndex;
      }
    }

    return tokens;
  }
}

const RULES = {
  identifier: /[a-zA-Z]\w*/,
  keyword_main: "main",
  keyword_void: "void",
  keyword_goto: "goto",
  keyword_continue: "continue",
  keyword_break: "break",
  keyword_switch: "switch",
  keyword_case: "case",
  keyword_return: "return",
  keyword_sizeof: "sizeof",
  keyword_int: "int",
  keyword_short: "short",
  keyword_double: "double",
  keyword_long: "long",
  keyword_float: "float",
  keyword_if: "if",
  keyword_else: "else",
  keyword_for: "for",
  keyword_while: "while",
  keyword_do: "do",
  keyword_const: "const",
  keyword_static: "static",
  keyword_struct: "struct",
  keyword_union: "union",
  keyword_enum: "enum",
  keyword_typedef: "typedef",
  keyword_auto: "auto",
  keyword_register: "register",
  keyword_unsigned: "unsigned",
  keyword_signed: "signed",
  keyword_char: "char",
  keyword_boolean: "boolean",
  keyword_true: "true",
  keyword_false: "false",
  keyword_null: "null",
  keyword_this: "this",
  keyword_super: "super",
  keyword_new: "new",
  keyword_delete: "delete",
  keyword_instanceof: "instanceof",
  keyword_typeof: "typeof",
  keyword_void: "void",
  keyword_var: "var",
  keyword_let: "let",
  keyword_const: "const",
  keyword_function: "function",
  keyword_class: "class",
  keyword_interface: "interface",
  keyword_package: "package",
  keyword_import: "import",
  keyword_export: "export",
  keyword_throw: "throw",
  keyword_try: "try",
  keyword_catch: "catch",
  keyword_finally: "finally",
  keyword_debugger: "debugger",
  LBRACKET: "(",
  RBRACKET: ")",
  LBRACE: "{",
  RBRACE: "}",
  LSBRACKET: "[",
  RSBRACKET: "]",
  delimiter_comma: ":",
  delimiter_semicolon: ";",
  delimiter_dot: ".",
  delimiter_colon: ":",
  delimiter_arrow: "=>",
  operator_equal: /==/,
  operator_nequal: /!=/,
  operator_lequal: /<=/,
  operator_hequal: />=/,
  operator_lshift: /<</,
  operator_rshift: />>/,
  operator_or: /\|\|/,
  operator_and: /&&/,
  operator_less: /</,
  operator_great: />/,
  operator_plusa: /\+=/,
  operator_minusa: /\-=/,
  operator_pluss: /\+\+/,
  operator_minuss: /\-\-/,
  operator_plus: /\+/,
  operator_minus: /-/,
  operator_ass: /=/,
  operator_multiply: /\*/,
  operator_xor: /\^/,
  operator_complement: /~/,
  operator_division: /\//,
  operator_remainder: /%/,
  operator_increment: "++",
  operator_decrement: "--",
  operator_logical_not: "!",
  operator_bitwise_not: "~",
  operator_logical_or: "||",
  operator_logical_and: "&&",
  operator_bitwise_or: "|",
  operator_bitwise_and: "&",
  operator_bitwise_xor: "^",
  operator_shift_left: "<<",
  operator_shift_right: ">>",
  operator_arrow_function: "=>",
  operator_assignment: /=/,
  operator_equal: /==/,
  number_float: /\d(\d)*\.\d(\d)*/,
  number_int: /\d(\d)*/,
  NEWLINE: /\n/,
  SKIP: /[ \t]+/,
  MISMATCH: /./,
  regex_pattern: /\/(.*)\//,
  multiline_comment: /\/\*(.|\n)*\*\//,
  singleline_comment: /\/\/.*\n/,
  string_literal: /'[^']*'|"[^"]*"/,
comment: /\/\/.*\n|\/\*(.|\n)*\*\//
};

function analyzeFile() {
  const fileInput = document.getElementById("fileInput");
  const file = fileInput.files[0];

  if (file) {
    const reader = new FileReader();

    reader.onload = function (e) {
      const fileContent = e.target.result;
      analyzeExpression(fileContent);
    };

    reader.readAsText(file);
  } else {
    alert("Please select a file.");
  }
}

function analyzeExpression(inputExpression) {
  const lexer = new Lexer(inputExpression);
  const tokens = lexer.tokenize();

  const tableBody = document.getElementById("lexanalyzerTableBody");
  tableBody.innerHTML = "";

  tokens.forEach((token) => {
    const row = tableBody.insertRow();
    const typeCell = row.insertCell(0);
    const valueCell = row.insertCell(1);
    const lineCell = row.insertCell(2);
    const indexCell = row.insertCell(3);
    const blockCell = row.insertCell(4);

    const displayType = token.type === "DELIMITER" ? token.value : token.type;

    typeCell.textContent = displayType;
    valueCell.textContent = token.value;
    lineCell.textContent = token.lineNumber;
    indexCell.textContent = token.index;
    blockCell.textContent = token.block;
  });

  document.querySelector(".container").style.display = "block";
}
