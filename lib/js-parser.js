(function(window) {
    const skipSpace = (string) => {
        const index = string.search(/\S/);
        if (index === -1) return '';
        return string.slice(index);
    }

    const parseExpression = (program) => {
        program = skipSpace(program);

        let expr, match;

        if ((match = program.match(/^([0-9]+)/))) {
            expr = {type: 'value', value: Number(match[1])};
        } else if ((match = program.match(/^"([^"]+)"/))) {
            expr = {type: 'value', value: match[1]};
        } else if ((match = program.match(/^([^(),#\s]+)/))) {
            expr = {type: 'word', name: match[1]};
        } else {
            throw new SyntaxError(`Unexpected char: ${program}`);
        }

        return parseApply(expr, program.slice(match[0].length));
    }

    const parseApply = (expr, program) => {
        program = skipSpace(program);

        if (program[0] !== '(') {
            return {rest: program, expr};
        }

        program = skipSpace(program.slice(1));
        expr = {type: 'apply', args: [], operator: expr};

        while (program[0] !== ')') {
            let res = parseExpression(program);
            expr.args.push(res.expr);
            program = skipSpace(res.rest);
            
            if (program[0] === ',') {
                program = skipSpace(program.slice(1));
            } else if (program[0] !== ')') {
                throw new Error('Expected ) or ,');
            }
        }

        return {rest: program.slice(1), expr};
    }

    const run = program => {
        return parse(program);
    }

    const parse = (program) => {
        const expr = parseExpression(program);

        console.log(expr);
    }

    window.jsParser = {
        run
    }
}(window));