let nextUnitWork;

function perforUnitOfWork(fiber) {
  // 创建DOM
  // 为当前fiber创建子fiber
  // 返回下一个执行单元

  if (!fiber.dom) {
    fiber.dom = createDom(fiber)
  }

  if (fiber.parent) {
    fiber.parent.dom.appendChild(fiber.dom)
  }

  const elements = fiber.props?.children
  let prevSibling = null
  elements && elements.forEach((childElement, index) => {
    const newFiber = {
      parent: fiber,
      props: childElement.props,
      type: childElement.type,
      dom: null,
    }

    if (index === 0) {
      fiber.child = newFiber
    } else {
      prevSibling.sibling = newFiber
    }

    prevSibling = newFiber
  })

  if (fiber.child) {
    return fiber.child
  }

  let nextFiber = fiber
  while (nextFiber) {
    if (nextFiber.sibling) {
      return nextFiber.sibling
    }

    nextFiber = nextFiber.fiber
  }
}

function workLoop(deadline) {
  // 是否有下一个任务
  // 是否有剩余时间
  // 执行任务

  let shouldYield = true

  while (nextUnitWork && shouldYield) {
    shouldYield = deadline.timeRemaining() > 1

    nextUnitWork = perforUnitOfWork(nextUnitWork)
  }

  requestIdleCallback(workLoop)
}

requestIdleCallback(workLoop)

function createDom(element) {
  const dom =
    element.type === 'TEXT_ELEMENT'
      ? document.createTextNode('')
      : document.createElement(element.type)

  const isProperty = (key) => key !== 'children'
  Object.keys(element.props)
    .filter(isProperty)
    .forEach((key) => dom[key] = element.props[key]);

  return dom
}

function render(element, container) {
  // 构建fiber
  nextUnitWork = {
    dom: container,
    props: {
      children: [element]
    },
    parent: undefined,
  }
}

const ReactDom = {
  render
}

export default ReactDom