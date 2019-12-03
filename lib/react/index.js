(function(window) {
    const TEXT_ELEMENT = 'TEXT ELEMENT';

    const createElement = (type, props, children) => {
        return {
            type,
            props: Object.assign({}, props, {
                children: (children || []).map(child => {
                    if (typeof child === 'string') {
                        return createTextElement(child);
                    } else {
                        return child;
                    }
                })
            })
        }
    }

    const createTextElement = (text) => {
        return createElement(TEXT_ELEMENT, {
            nodeValue: text
        });
    }

    const createDom = (fiber) => {
        const dom = fiber.type === TEXT_ELEMENT ? document.createTextNode("") : document.createElement(fiber.type);

        updateProps(dom, {}, fiber.props);

        return dom;
    }

    const ROOT_HOST = 'root';
    const HOST_COMPONENT = 'host';
    const CLASS_COMPONENT = 'class';

    const updateQueue = [];

    let nextUnitOfWork = null;
    let pendingCommit = null;

    const render = (elements, parentDom) => {
        updateQueue.push({
            from: ROOT_HOST,
            dom: parentDom,
            newProps: { children: elements }
        })

        requestIdleCallback(performWork);
    }

    const performWork = (deadline) => {
        workLoop(deadline);

        if (nextUnitOfWork || updateQueue.length > 0) {
            requestIdleCallback(performWork);
        }
    }

    const workLoop = (deadline) => {
        if (!nextUnitOfWork) {
            resetUnitOfWork();
        }

        while (nextUnitOfWork && deadline.timeRemaining() > 1) {
            nextUnitOfWork = performUnitOfWork(nextUnitOfWork);
        }

        if (!nextUnitOfWork && pendingCommit) {
            commitAllWork(pendingCommit);
        }
    }

    const commitAllWork = (fiber) => {
        if (!fiber.effects) {
            return;
        }

        fiber.effects.forEach(effect => {
            commitWork(effect);
        });
        fiber.stateNode._rootContainerFiber = fiber;
        pendingCommit = null;
        nextUnitOfWork = null;
    }

    const commitWork = (fiber) => {
        let parentFiber = fiber.parent;

        while (parentFiber.tag == CLASS_COMPONENT) {
            parentFiber = parentFiber.parent;
        }

        const parentDom = parentFiber.stateNode;

        if (fiber.effectTag === PLACEMENT && fiber.tag === HOST_COMPONENT) {
            parentDom.appendChild(fiber.stateNode);
        } else if (fiber.effectTag === UPDATE) {
            updateProps(fiber.stateNode, fiber.alternate.props, fiber.props);
        }
    }

    const isEvent = name => name.startsWith('on');
    const isAttribute = name => !isEvent(name) && name !== 'children';
    const changedAttribute = (oldProps, newProps) => name => oldProps[name] !== newProps[name];

    const updateProps = (dom, oldProps, newProps) => {
        Object.keys(oldProps).filter(isAttribute)
            .filter(changedAttribute(oldProps, newProps)).forEach(name => {
            dom[name] = null;
        });

        Object.keys(newProps).filter(isAttribute)
            .filter(changedAttribute(oldProps, newProps)).forEach(name => {
            dom[name] = newProps[name];
        });
    }

    const resetUnitOfWork = () => {
        const update = updateQueue.shift();

        if (!update) {
            return;
        }

        const rootFiber = update.dom ? update.dom._rootContainerFiber : getRoot(root.instance.__fiber);

        nextUnitOfWork = {
            type: ROOT_HOST,
            stateNode: update.dom || rootFiber.stateNode,
            props: update.newProps || rootFiber.props,
            alternate: rootFiber
        }
    }

    const getRoot = (fiber) => {
        let node = fiber;

        while (node.parent) {
            node = node.parent;
        }

        return node;
    }

    const performUnitOfWork = (wipFiber) => {
        beginWork(wipFiber);

        if (wipFiber.child) {
            return wipFiber.child;
        }

        let uow = wipFiber;

        while (uow.parent) {
            completeWork(uow);

            if (uow.sibling) {
                return uow.sibling;
            }

            uow = uow.parent;
        }

        pendingCommit = uow;
    }

    const completeWork = (fiber) => {
        if (fiber.tag === ROOT_HOST) {
            return;
        } else {
            const thisEffects = fiber.effects || [];
            const parentEffects = fiber.parent.effects || [];

            if (fiber.effectTag) {
                thisEffects.unshift(fiber);
            }

            fiber.parent.effects = thisEffects.concat(parentEffects);
        }
    }

    const beginWork = (wipFiber) => {
        if (wipFiber.tag === CLASS_COMPONENT) {
            updateClassComponent(wipFiber);
        } else {
            updateHostComponent(wipFiber);
        }
    }

    const updateClassComponent = (wipFiber) => {
        let stateNode = wipFiber.stateNode;

        if (!stateNode) {
            stateNode = wipFiber.stateNode = wipFiber.type(wipFiber.props);
        }

        updateChildrenArray(wipFiber, stateNode);
    }

    const updateHostComponent = (wipFiber) => {
        let stateNode = wipFiber.stateNode;

        if (!stateNode) {
            stateNode = wipFiber.stateNode = createDom(wipFiber);
        }

        const children = wipFiber.props.children || [];

        updateChildrenArray(wipFiber, children);
    }

    const arrify = (arr) => {
        return arr ? Array.isArray(arr) ? arr : [arr] : [];
    }

    const PLACEMENT = 1;
    const UPDATE = 2;

    const updateChildrenArray = (wipFiber, children) => {
        children = arrify(children);

        let oldFiber = wipFiber.alternate ? wipFiber.alternate.child : null;
        let newFiber = null;
        let index = 0;

        while (index < children.length) {
            const element = index < children.length ? children[index] : null;
            const prevFiber = newFiber;
            const isSame = element && oldFiber && (element.type == oldFiber.type);

            if (isSame) {
                newFiber = {
                    tag: oldFiber.tag,
                    type: oldFiber.type,
                    stateNode: oldFiber.stateNode,
                    parent: wipFiber,
                    props: element.props,
                    effectTag: UPDATE,
                    alternate: oldFiber
                }
            }

            if (!oldFiber && element) {
                newFiber = {
                    tag: (typeof element.type === 'string') ? HOST_COMPONENT : CLASS_COMPONENT,
                    type: element.type,
                    props: element.props,
                    parent: wipFiber,
                    effectTag: PLACEMENT,
                    alternate: oldFiber
                }
            }

            if (oldFiber) {
                oldFiber = oldFiber.sibling;
            }

            if (index === 0) {
                wipFiber.child = newFiber;
            } else if (prevFiber && element) {
                prevFiber.sibling = newFiber;
            }

            index++;
        }
    }

    window.fiber = {
        createElement,
        render
    }
}(window));

const { useState, render, createElement } = window.fiber;

function Counter(props) {
    return [createElement('h1', {
        onClick: () => {
            setState(c => c + 1)
        }
    }, [props.a]), createElement('h2')]
}
let text = 'Some text';

const container = document.getElementById("root")
render(createElement(Counter, { a: '1'}), container);

setTimeout(() => {

    render(createElement(Counter, { a: '12fdsa'}), container);
}, 3000);

let previousInstance = null;

const render = (element, parentDom) => {
    previousInstance = reconcile(parentDom, previousInstance, element);
}
