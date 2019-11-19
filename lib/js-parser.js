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
            match = {type: 'word', name: expr[1]}; 
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

    const run = (code) => {
        const tree = parse(code);
        
        const globalScope = {};

        evaluate(tree, globalScope);
    }

    const specialForms = {
        do: function(args, scope) {
            
        }
    };

    const evaluate = (tree, scope) => {
        if (tree.type === 'value') {
            return tree.value;
        } else if (tree.type === 'word') {
            if (tree.name in scope) {
                return scope[tree.name];
            } else {
                throw new ReferenceError(`Undefined binding: ${tree.name}`);
            }
        } else if (tree.type === 'apply') {
            const { operator, args } = tree;

            if (operator.type === 'word' && operator.name in specialForms) {
                return specialForms[operator.name](tree.args, scope);
            } else {
                let op = evaluate(operator, scope);
                if (typeof op === 'function') {
                    return op(...args.map(arg => evaluate(arg, scope)));
                } else {
                    throw new TypeError('Applying a non-function');
                }
            }
        }
    }

    window.jsParser = {
        run
    }
}(window));