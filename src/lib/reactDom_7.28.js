import { TEXT_ELEMENT } from "./constants";

let nextUnitWork;

function createDom(fiber) {
  // 1.创建节点
  // 2.赋予属性

  const dom = fiber.type === TEXT_ELEMENT
    ? document.createTextNode('')
    : document.createElement(fiber.type)

  const isProperty = (key) => key !== 'children'
  fiber.props
    && Object.keys(fiber.props)
      .filter(isProperty)
      .forEach((key) => dom[key] = fiber.props[key])

  return dom
}

function perForNextUnitWork(fiber) {
  // 1.构建dom
  // 2.构建子fiber
  // 3.返回下一个工作任务

  if (!fiber.dom) {
    fiber.dom = createDom(fiber)
  }

  if (fiber.parent) {
    fiber.parent.dom.appendChild(fiber.dom)
  }

  const children = fiber.props?.children
  let prevFiber;
  children && children.forEach((child, index) => {
    const newFiber = {
      type: child.type,
      props: child.props,
      parent: fiber,
      dom: undefined
    }

    if (index === 0) {
      fiber.child = newFiber
    } else {
      prevFiber.sibling = newFiber
    }

    prevFiber = newFiber
  })

  if (fiber.child) {
    return fiber.child
  }

  let nextFiber = fiber
  while (nextFiber) {
    if (nextFiber.sibling) {
      return nextFiber.sibling
    }

    nextFiber = nextFiber.parent
  }
}

function workLoop(deadline) {
  // 1.有空闲
  // 2.有任务
  // 3.执行任务并返回下一个任务

  let shouldYield = true

  while (shouldYield && nextUnitWork) {
    nextUnitWork = perForNextUnitWork(nextUnitWork)
    shouldYield = deadline.timeRemaining > 1
  }

  requestIdleCallback(workLoop)
}

requestIdleCallback(workLoop)

function render(element, container) {
  nextUnitWork = {
    props: {
      children: [element]
    },
    dom: container,
    parent: undefined,
    child: undefined,
  }
}


const reactDom = {
  render
}

export default reactDom