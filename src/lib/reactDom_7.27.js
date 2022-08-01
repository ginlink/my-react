/**
 * New:
 *  1.新增concurrent mode
 */

import { TEXT_ELEMENT } from './constants'

let nextUnitWork;

function createDom(element) {
  const dom =
    element.type === TEXT_ELEMENT
      ? document.createTextNode('')
      : document.createElement(element.type)

  const isProperty = (key) => key !== 'children'
  element?.props &&
    Object.keys(element.props)
      .filter(isProperty)
      .forEach((key) => dom[key] = element.props[key])

  return dom
}

function perForUnitWork(fiber) {
  // 创建DOM
  // 为当前fiber创建子fiber
  // 返回下一个执行单元

  if (!fiber.dom) {
    fiber.dom = createDom(fiber)
  }

  if (fiber.parent) {
    fiber.parent.dom.appendChild(fiber.dom)
  }

  const children = fiber.props?.children
  let prevChild;
  children && children.forEach((child, index) => {
    const newFiber = {
      parent: fiber,
      type: child.type,
      props: child.props,
      dom: undefined
    }

    if (index === 0) {
      fiber.child = newFiber
    } else {
      prevChild.sibling = newFiber
    }

    prevChild = newFiber
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
  // 是否有空闲时间
  // 是否有任务
  // 渲染节点

  let shouldYield = true
  while (shouldYield && nextUnitWork) {
    nextUnitWork = perForUnitWork(nextUnitWork)
    shouldYield = deadline.timeRemaining > 1
  }

  requestIdleCallback(workLoop)
}

requestIdleCallback(workLoop)

export function render(element, container) {
  nextUnitWork = {
    dom: container,
    props: {
      children: [element]
    },
    parent: undefined
  }
}
