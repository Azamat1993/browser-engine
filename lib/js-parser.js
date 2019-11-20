(function(window) {
  const skipSpace = string => {
    const index = string.search(/\S/);
    if (index === -1) return "";
    return string.slice(index);
  };

  const parseExpression = program => {
    program = skipSpace(program);

    let expr, match;

    if ((match = program.match(/^([0-9]+)/))) {
      expr = { type: "value", value: Number(match[1]) };
    } else if ((match = program.match(/^"([^"]+)"/))) {
      expr = { type: "value", value: match[1] };
    } else if ((match = program.match(/^([^(),#\s]+)/))) {
      expr = { type: "word", name: match[1] };
    } else {
      throw new SyntaxError(`Unexpected char: ${program}`);
    }

    return parseApply(expr, program.slice(match[0].length));
  };

  const parseApply = (expr, program) => {
    program = skipSpace(program);

    if (program[0] !== "(") {
      return { rest: program, expr };
    }

    program = skipSpace(program.slice(1));
    expr = { type: "apply", args: [], operator: expr };

    while (program[0] !== ")") {
      let res = parseExpression(program);
      expr.args.push(res.expr);
      program = skipSpace(res.rest);

      if (program[0] === ",") {
        program = skipSpace(program.slice(1));
      } else if (program[0] !== ")") {
        throw new Error("Expected ) or ,");
      }
    }

    return { rest: program.slice(1), expr };
  };

  const globalScope = Object.create(null);

  globalScope.true = true;
  globalScope.false = false;

  for (let op of ["-", "+", "*", "/", ">", "<"]) {
    globalScope[op] = Function("a", "b", `return a ${op} b;`);
  }

  const run = program => {
    const expr = parse(program);

    return evaluate(expr, Object.create(globalScope));
  };

  const specialForms = {};

  specialForms.do = function(args, scope) {
    let value;

    for (let arg of args) {
      value = evaluate(arg, scope);
    }

    return value;
  };

  const evaluate = (expr, scope) => {
    if (expr.type === "value") {
      return expr.value;
    } else if (expr.type === "word") {
      const { name } = expr;
      if (name in scope) {
        return scope[name];
      } else {
        throw new Error(`Variable ${name} not in scope`);
      }
    } else if (expr.type === "apply") {
      const { operator, args } = expr;

      if (operator.type === "word" && operator.name in specialForms) {
        return specialForms[operator.name](args, scope);
      } else {
        let op = evaluate(operator, scope);

        if (typeof op === "function") {
          return op(...args.map(arg => evaluate(arg, scope)));
        } else {
          throw new Error(`Operator should be a function: ${operator.type}`);
        }
      }
    } else {
      throw new Error(`Unknown type of the expression: ${expr.type}`);
    }
  };

  const parse = program => {
    const res = parseExpression(program);

    if (skipSpace(res.rest).length > 0) {
      throw new Error(`Unexpected end of the script: ${res.rest}`);
    }

    return res.expr;
  };

  window.jsParser = {
    run
  };
})(window);
