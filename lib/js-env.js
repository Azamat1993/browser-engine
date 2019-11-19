(function(window) {
    const run = (code, myDocument) => {
        console.log(jsParser.run(code));
    }

    window.jsenv = {
        run
    }
}(window));