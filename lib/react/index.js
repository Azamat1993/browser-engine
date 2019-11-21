(function(window) {
    const ENOUGH_TIME = 1;
    const HOST_COMPONENT = 'host';
    const CLASS_COMPONENT = 'class';
    const HOST_ROOT = 'host';

    const  updateQueue = [];
    let nextUnitOfWork = null;
    let pendingCommit = null;

    function schedule(task) {
        updateQueue.push(task);
        requestIdleCallback(performWork);
    }

    function performWork(deadline) {
        workLoop(deadline);


        if (nextUnitOfWork || updateQueue.length > 0) {
            requestIdleCallback(performWork);
        }
    }

    function workLoop(deadline) {
        if (!nextUnitOfWork) {
            resetNextUnitOfWork();
        }

        while (nextUnitOfWork && deadline.timeRemaining() > ENOUGH_TIME) {
            nextUnitOfWork = performUnitOfWork(nextUnitOfWork);
        }

        if (pendingCommit) {
            commitAllWork(pendingCommit);
        }
    }

    function resetNextUnitOfWork() {
        const update = updateQueue.shift();

        if (!update) {
            return;
        }

        if (update.partialState) {
            update.isntance.__fiber.partialState = update.partialState;
        }

        const root = update.from == HOST_ROOT ? update.dom._rootContainerFiber : getRoot(update.instance.__fiber);

        nextUnitOfWork = {
            tag: HOST_ROOT,
            stateNode: update.dom || root.stateNode,
            props: update.newProps || root.props,
            alternate: root
        };
    }

    function performUnitOfWork(wipFiber) {
        beginWork(wipFiber);

        if (wipFiber.child) {
            return wipFiber.child;
        }

        let uow = wipFiber;

        while (uow) {
            completeWork(uow);
            if (uow.sibling) {
                return uow.sibling;
            }
            uow = uow.parent;
        }
    }

    function completeWork(fiber) {
        if (fiber.tag === CLASS_COMPONENT) {
            fiber.stateNode.__fiber = fiber;
        }

        if (fiber.parent) {
            const childEffects = fiber.effects || [];
            const thisEffect = fiber.effectTag !== null ? [fiber] : [];
            const parentEffects = fiber.parent.effects || [];
            fiber.parent.effects = parentEffects.concat(childEffects, thisEffect);
        } else {
            pendingCommit = fiber;
        }
    }

    function beginWork(wipFiber) {
        if (wipFiber.tag == CLASS_COMPONENT) {
            updateClassComponent(wipFiber);
        } else {
            updateHostComponent(wipFiber);
        }
    }

    function updateHostComponent(wipFiber) {
        if (!wipFiber.stateNode) {
            wipFiber.stateNode = createDomElement(wipFiber);
        }
        const newChildElements = wipFiber.props.children;
        reconcileChildrenArray(wipFiber, newChildElements);
    }

    function createDomElement(fiber) {
        const el = createElement(fiber.type, fiber.props);
        return document.createElement(el.type);
    }

    function updateClassComponent(wipFiber) {
        let instance = wipFiber.stateNode;
        if (instance == null) {
            instance = wipFiber.stateNode = createInstance(wipFiber);
        } else if (wipFiber.props == instance.props && !wipFiber.partialState) {
            cloneChildFibers(wipFiber);
            return;
        }

        instance.props = wipFiber.props;
        instance.state = Object.assign({}, instance.state, wipFiber.partialState);
        wipFiber.partialState = null;

        const newChildElements = wipFiber.stateNode.render();
        reconcileChildrenArray(wipFiber, newChildElements);
    }

    function cloneChildFibers(parentFiber) {
        const oldFiber = parentFiber.altername;
        if (!oldFiber.child) {
            return;
        }

        let oldChild = oldFiber.child;
        let prevChild = null;

        while (oldChild) {
            const newChild = {
                type: oldChild.type,
                tag: oldChild.tag,
                stateNode: oldChild.stateNode,
                props: oldChild.props,
                partialState: oldChild.partialState,
                altername: oldChild,
                parent: parentFiber
            };

            if (prevChild) {
                prevChild.sibling = newChild;
            } else {
                parentFiber.child = newChild;
            }

            prevChild = newChild;
            oldChild = oldChild.sibling;
        }
    }


    function reconcileChildrenArray(wipFiber, newChildElements) {
        const elements = arrify(newChildElements);

        let index = 0;
        let oldFiber = wipFiber.alternate ? wipFiber.alternate.child : null;
        let newFiber = null;

        while (index < elements.length || oldFiber !== null) {
            const prevFiber = newFiber;
            const element = index < elements.length && elements[index];
            const sameType = oldFiber && element && element.type == oldFiber.type;

            if (sameType) {
                newFiber = {
                    type: oldFiber.type,
                    tag: oldFiber.tag,
                    stateNode: oldFiber.stateNode,
                    props: element.props,
                    parent: wipFiber,
                    altername: oldFiber,
                    partialState: oldFiber.partialState,
                    effectTag: UPDATE
                };
            }

            if (element && !sameType) {
                newFiber = {
                    type: element.type,
                    tag: typeof element.type === 'string' ? HOST_COMPONENT : CLASS_COMPONENT,
                    props: element.props,
                    parent: wipFiber,
                    effectTag: PLACEMENT
                }
            }

            if (oldFiber && !sameType) {
                oldFiber.effectTag = DELETION;
                wipFiber.effects = wipFiber.effects || [];
                wipFiber.effects.push(oldFiber);
            }

            if (oldFiber) {
                oldFiber = oldFiber.sibling;
            }

            if (index == 0) {
                wipFiber.child = newFiber;
            } else if (prevFiber && element) {
                prevFiber.sibling = newFiber;
            }

            index++;
        }
    }

    function getRoot(fiber) {
        let node = fiber;

        while (node.parent) {
            node = node.parent;
        }

        return node;
    }

    const TEXT_ELEMENT = 'TEXT_ELEMENT';

    function createElement(type, props, ...children) {
        props = Object.assign({}, props);
        const hasChildren = children.length > 0;
        const rawChildren = hasChildren ? [].concat(...children) : [];

        props.children = rawChildren
            .filter(c => c !== null && c !== false)
            .map(c => c instanceof Object ? c : createTextElement(c));
        return {type, props};
    }

    function createTextElement(text) {
        return createElement(TEXT_ELEMENT, { nodeValue: text });
    }

    const updateDomProperties = (dom, oldProps, newProps) => {
        const isAttribute = name => name !== 'children';

        Object.keys(oldProps).filter(isAttribute).forEach(name => {
            dom[name] = null;
        });

        Object.keys(newProps).filter(isAttribute).forEach(name => {
            dom[name] = newProps[name];
        });
    }

    class Component {
        constructor(props) {
            this.props = props;
            this.state = this.state || {};
        }

        setState(partialState) {
            schedule(this, partialState);
        }
    }

    function createInstance(fiber) {
        const instance = new fiber.type(fiber.props);
        instance.__fiber = fiber;
        return instance;
    }

    function render(elements, containerDom) {
        updateQueue.push({
            from: HOST_ROOT,
            dom: containerDom,
            newProps: { children: elements }
        });

        requestIdleCallback(performWork);
    }

    function scheduleUpdate(instance, partialState) {
        updateQueue.push({
            from: CLASS_COMPONENT,
            instance: instance,
            partialState: partialState
        });

        requestIdleCallback(performWork);
    }

    const PLACEMENT = 1;
    const DELETION = 2;
    const UPDATE = 3;

    function arrify(val) {
        return val == null ? [] : Array.isArray(val) ? val : [val];
    }

    function commitAllWork(fiber) {
        fiber.effects.forEach(f => {
            commitWork(f);
        });
        fiber.stateNode._rootContainerFiber = fiber;
        nextUnitOfWork = null;
        pendingCommit = null;
    }

    function commitWork(fiber) {
        if (fiber.tag == HOST_ROOT) {
            return;
        } else {
            let domParentFiber = fiber.parent;
            while (domParentFiber.tag === CLASS_COMPONENT) {
                domParentFiber = domParentFiber.parent;
            }
            const domParent = domParentFiber.stateNode;

            if (fiber.effectTag == PLACEMENT && fiber.tag == HOST_COMPONENT) {
                domParent.appendChild(fiber.stateNode);
            } else if (fiber.effectTag == UPDATE) {
                updateDomProperties(fiber.stateNode, fiber.altername.props, fiber.props);
            } else if (fiber.effectTag == DELETION) {
                commitDeletion(fiber, domParent);
            }
        }
    }

    function commitDeletion(fiber, domParent) {
        let node = fiber;

        while (true) {
            if (node.tag === CLASS_COMPONENT) {
                node = node.child;
                continue;
            }

            domParent.removeChild(node.stateNode);

            while (node != fiber && !node.sibling) {
                node = node.parent;
            }

            if (node == fiber) {
                return;
            }

            node = node.sibling;
        }
    }

    window.fiber = {
        createElement,
        render,
        Component
    }
}(window));


const { createElement, Component, render } = window.fiber;

class HelloMessage extends Component {
  render() {
    return createElement('div', {}, createElement('TEXT ELEMENT', {
        nodeValue: 'adsf'
    }));
  }
}

render(
    createElement(HelloMessage),
  document.getElementById("root")
);
