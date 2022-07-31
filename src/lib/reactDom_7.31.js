import { TEXT_ELEMENT } from "./constants";

let nextUnitWork;
let wipRoot;
let currentRoot;
let delections = []

function createDom(fiber) {
  // 1.创建节点
  // 2.赋予属性

  const dom = fiber.type === TEXT_ELEMENT
    ? document.createTextNode('')
    : document.createElement(fiber.type)

  updateDom(dom, {}, fiber.props)

  return dom
}

function reconciliationDom(wipFiber, elements) {
  let prevFiber, i = 0;
  let oldFiber = wipFiber.alternate && wipFiber.alternate.child

  while ((elements && i < elements.length) || !!oldFiber) {
    const childElement = elements[i]
    const sameType = oldFiber && childElement && oldFiber.type === childElement.type
    let newFiber;

    if (sameType) {
      newFiber = {
        type: childElement.type,
        props: childElement.props,
        parent: wipFiber,
        dom: oldFiber.dom,
        alternate: oldFiber,
        effectTag: 'UPDATE'
      }
    }

    if (!sameType && childElement) {
      newFiber = {
        type: childElement.type,
        props: childElement.props,
        parent: wipFiber,
        dom: undefined,
        alternate: undefined,
        effectTag: 'PLACEMENT'
      }
    }

    if (!sameType && oldFiber) {
      oldFiber.effectTag = 'DELECTION'
      delections.push(oldFiber)
    }

    if (oldFiber) {
      oldFiber = oldFiber.sibling
    }


    if (i === 0) {
      wipFiber.child = newFiber
    } else if (prevFiber) {
      prevFiber.sibling = newFiber
    }

    prevFiber = newFiber
    ++i
  }
}

function performNextUnitWork(fiber) {
  // 1.构建dom
  // 2.构建子fiber
  // 3.返回下一个工作任务

  if (!fiber.dom) {
    fiber.dom = createDom(fiber)
  }

  const elements = fiber.props?.children
  reconciliationDom(fiber, elements)

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

const isProperty = (key) => key !== 'children'
const isEvent = (key) => key.startsWith('on')
const isGone = (prev, next) => (key) => !(key in next)
const isNew = (prev, next) => (key) => prev[key] !== next[key]
function updateDom(dom, prevProps, nextProps) {
  // 1.移出所有老的属性 (事件)
  // 2.增加新的属性 (事件)

  Object.keys(prevProps)
    .filter(isProperty)
    .filter(isGone(prevProps, nextProps))
    .forEach((key) => {
      dom[key] = ''
    })

  Object.keys(prevProps)
    .filter(isEvent)
    .filter((key) =>
      isGone(prevProps, nextProps)(key)
      || isNew(prevProps, nextProps)(key)
    )
    .forEach((key) => {
      const eventType = key.slice(2).toLowerCase()
      dom.removeEventListener(
        eventType,

        // why is not dom[key] ?
        prevProps[key]
      )
    })

  Object.keys(nextProps)
    .filter(isProperty)
    .filter(isNew(prevProps, nextProps))
    .forEach((key) => dom[key] = nextProps[key])

  Object.keys(nextProps)
    .filter(isEvent)
    .filter(isNew(prevProps, nextProps))
    .forEach((key) => {
      const eventType = key.slice(2).toLowerCase()
      dom.addEventListener(
        eventType,
        nextProps[key]
      )
    })
}

function commitWork(fiber) {
  if (!fiber) {
    return
  }

  const parentDom = fiber.parent.dom
  // parentDom.appendChild(fiber.dom)

  switch (fiber.effectTag) {
    case "PLACEMENT":
      !!fiber.dom && parentDom.appendChild(fiber.dom)
      break;
    case "UPDATE":
      !!fiber.dom && updateDom(fiber.dom, fiber.alternate.props, fiber.props)
      break;
    case "DELECTION":
      !!fiber.dom && parentDom.removeChild(fiber.dom)
      break;

    default:
      break;
  }

  commitWork(fiber.child)
  commitWork(fiber.sibling)
}

function commitRoot() {
  // 1.commit
  // 2.维护wipRoot状态
  commitWork(wipRoot.child)
  // commitWork(delections)
  delections.forEach(commitWork)

  currentRoot = wipRoot

  wipRoot = undefined
}

function workLoop(deadline) {
  // 1.有空闲
  // 2.有任务
  // 3.执行任务并返回下一个任务

  let shouldYield = true

  while (shouldYield && nextUnitWork) {
    nextUnitWork = performNextUnitWork(nextUnitWork)
    shouldYield = deadline.timeRemaining > 1
  }

  // commit
  if (!nextUnitWork && wipRoot) {
    commitRoot()
  }

  requestIdleCallback(workLoop)
}

requestIdleCallback(workLoop)

export function render(element, container) {
  wipRoot = {
    props: {
      children: [element]
    },
    dom: container,
    parent: undefined,
    child: undefined,
    alternate: currentRoot,
  }

  nextUnitWork = wipRoot
  delections = []
}
