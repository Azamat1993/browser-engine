(function(window) {
    const run = (code, myDocument) => {
        console.log(jsParser.parse(code));
    }

    window.jsenv = {
        run
    }
}(window));