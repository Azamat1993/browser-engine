(function(window) {
  const { libuv } = window;

  class Timer {
    constructor() {
      this.i = 0;
      this.tasks = [];
      this.startTimer();
    }

    startTimer() {
      this.updateTime();
    }

    updateTime() {
      requestAnimationFrame(() => {
        this.i++;
        this.executeTasks();
        this.updateTime();
      });
    }

    executeTasks() {
      this.tasks = this.tasks.filter(task => {
        if (task.time < this.i) {
          this.executeTask(task);
          return false;
        }
        return true;
      });
    }

    executeTask(task) {
      task.callback();
    }

    getCurrentTimeInMillis() {
      return this.i;
    }

    enqueueTask(callback, time) {
      this.tasks.push({
        callback,
        time
      });
    }
  }

  const timer = new Timer();

  const localSetTimeout = (callbackFn, time) => {
    timer.enqueueTask(() => libuv.pushTask(callbackFn), time);
  };

  window.browserApi = {
    setTimeout: localSetTimeout
  };
})(window);
