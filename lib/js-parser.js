(function(window) {
    const skipSpace = (code) => {
        const index = code.search(/\S/);
        if (index === -1) return '';
        return code.slice(index);
    }

    const parseExpression = (code) => {
        code = skipSpace(code);   
        
        let expr, match;

        if ((expr = code.match(/^([0-9]+)/))) {
            match = {type: 'value', value: Number(expr[1])};
        } else if ((expr = code.match(/^"([^"]+)"/))) {
            match = {type: 'value', value: expr[1]};
        } else if ((expr = code.match(/^([^#\s(),"]+)/))) {
            match = {type: 'name', name: expr[1]}; 
        } else {
            throw new SyntaxError(`Unexpected code: ${code}`);
        }

        return parseApply(match, code.slice(expr[0].length));
    }

    const parseApply = (match, program) => {
       program = skipSpace(program);

       if (program[0] !== '(') {
           return {rest: program, match};
       }

       program = skipSpace(program.slice(1));
       match = {type: 'apply', operator: match, args: []};

       while (program[0] !== ')') {
           const expr = parseExpression(program);
           match.args.push(expr.match);
           program = skipSpace(expr.rest);
           
           if (program[0] === ',') {
               program = skipSpace(program.slice(1));
           } else if (program[0] !== ')') {
               throw new SyntaxError('Expected ( or ,');
           }
       }

       return parseApply(match, program.slice(1));
    }

    const parse = (code) => {
        const parsedCode = parseExpression(code);

        if (parsedCode.rest.length > 0) {
            throw new Error('Unexpected ending of the code');
        }

        return parsedCode.match;
    }

    window.jsParser = {
        parse
    }
}(window));