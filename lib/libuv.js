(function(window) {
  const eventLoop = () => {
    // not actually a loop, cause of one threaded architecture of JS

    setInterval(function() {
      if (queue.length !== 0) {
        const task = queue.shift();

        task();
      }
    }, 1);
  };

  const queue = [];

  const pushTask = callback => {
    queue.push(callback);
  };

  eventLoop();

  window.libuv = {
    pushTask
  };
})(window);
