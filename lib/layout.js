(function(window) {
  class Dimension {
    constructor(width, height, top = 0, left = 0) {
      this.width = width;
      this.height = height;
      this.top = top;
      this.left = left;
    }

    canBeOnLeft(parentNode, currentSize) {
      return parentNode.width - (this.left + this.width) >= currentSize.width;
    }

    getWidthWithOffset() {
      return this.left + this.width;
    }

    getHeightWithOffset() {
      return this.top + this.height;
    }
  }

  const locate = (renderNode, parentDimension, siblingNode = null) => {
    const dimension = getDimensions(renderNode, parentDimension, siblingNode);

    renderNode.dimension = new Dimension(
      dimension.width,
      dimension.height,
      dimension.top,
      dimension.left
    );

    for(let child of renderNode.children) {
      siblingNode = locate(child, renderNode.dimension, siblingNode);
    }

    return renderNode;
  }

  const getDimensions = (renderNode, parentDimension, siblingNode) => {
    const cssRules = renderNode.rules;

    const getSize = (metric) => {
      return getDimension(metric, cssRules, parentDimension);
    }

    const size = {
      width: getSize('width'),
      height: getSize('height')
    };

    const getPos = pos => {
      return getPosition(pos, size, siblingNode, parentDimension);
    }

    const position = {
      top: getPos('top'),
      left: getPos('left')
    };

    return Object.assign({}, size, position);
  }

  const getPosition = (pos, size, siblingNode, parentDimension) => {
    if (siblingNode) {
      const { dimension } = siblingNode; 
      
      if (dimension.canBeOnLeft(parentDimension, size)) {
        switch(pos) {
          case 'top':
            return dimension.top;
          case 'left':
            return dimension.getWidthWithOffset();
        }
      } else {
        switch (pos) {
          case 'top':
            return dimension.getHeightWithOffset();
          case 'left':
            return parentDimension.left;
        }
      }
    } else {
      return parentDimension[pos];
    }
  }

  const getDimension = (metric, cssRules, parentDimension) => {
    const value = cssRules[metric];

    if (isPercentage(value)) {
      return getPercentage(value, parentDimension[metric]);
    } else if (isPixels(value)) {
      return getPixels(value, parentDimension[metric]);
    } else {
      return 0;
    }
  }

  const getPercentage = (value, parentValue) => {
    const percentage = value.match(/([0-9]+)/)[1];

    return (parentValue * percentage) / 100;
  }

  const getPixels = (value, parentValue) => {
    return parseInt(value, 10);
  }

  const isPercentage = (value) => {
    const val =  value.match(/%$/);
    return val;
  }

  const isPixels = value => {
    return value.match(/[0-9]+px$/);
  }

  window.myLayout = {
    locate,
    Dimension
  }
}(window));

