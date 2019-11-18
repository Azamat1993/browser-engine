(function(window) {
    const run = (code, myDocument) => {
        console.log(code, myDocument);
    }

    window.jsenv = {
        run
    }
}(window));