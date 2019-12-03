const describe = (text, cb) => {
  console.log(text);
  cb();
}

const it = (text, cb) => {
  return describe('  ' + text, cb);
}

const expect = (expr) => {
  return {
    toBe: (comp) => {
      if (comp === expr) {
        console.log('passed');
        return true;
      } else {
        console.error('failed');
        return false;
      }
    },

    toHaveBeenCalled: () => {
      if (expr.haveBeenCalled()) {
        console.log('passed');
      } else {
        console.log('failed');
      }
    }
  }
}

const spyOn = (fn) => {
  let haveBeenCalled = false;

  function finalFn(...args) {
    haveBeenCalled = true;
    let result = fn(...args);
    return result;
  }

  finalFn.haveBeenCalled = function() {
    return haveBeenCalled;
  }

  return finalFn;
}

describe('Upper', () => {
  describe('Inner', () => {
    it('should do stuff', () => {
      const myFn = () => {}
      const spyFn = spyOn(myFn);
      spyFn();
      expect(spyFn).toHaveBeenCalled();
      expect(1+1).toBe(2);
    });
  });
})
