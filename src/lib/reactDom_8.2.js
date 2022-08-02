// New:
// 1.新增function component
// 2.新增hooks

import { TEXT_ELEMENT, EFFECT_PLACEMENT, EFFECT_UPDATE, EFFECT_DELECTION } from "./constants";

let nextUnitWork,
  wipRoot,
  currentRoot,
  delections = [],
  wipFiber,
  hookIndex;

// wip: work in process

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
  // 比较新旧，构建新fiber

  let prevFiber,
    index = 0,
    oldFiber = wipFiber.alternate?.child;

  while (index < elements.length || oldFiber) {
    const childElement = elements[index]
    const sameType = oldFiber && childElement && oldFiber.type === childElement.type
    let newFiber;

    if (sameType) {
      newFiber = {
        type: childElement.type,
        props: childElement.props,
        parent: wipFiber,
        dom: oldFiber.dom,
        alternate: oldFiber,
        effectTag: EFFECT_UPDATE,
      }
    }

    if (!sameType && childElement) {
      newFiber = {
        type: childElement.type,
        props: childElement.props,
        parent: wipFiber,
        dom: undefined,
        alternate: undefined,
        effectTag: EFFECT_PLACEMENT,
      }
    }

    if (!sameType && oldFiber) {
      oldFiber.effectTag = EFFECT_DELECTION
      delections.push(oldFiber)
    }

    if (oldFiber) {
      oldFiber = oldFiber.sibling
    }

    if (index === 0) {
      wipFiber.child = newFiber
    } else {
      prevFiber.sibling = newFiber
    }

    prevFiber = newFiber
    ++index
  }
}

export function useState(initial) {
  // 1.有上次的值，用上次的值
  // 2.有上次更新的值，用上次的值更新状态
  // 3.维护hooks状态

  const oldHook = wipFiber?.alternate?.hooks?.[hookIndex]
  const hook = {
    state: oldHook ? oldHook.state : initial,
    queue: [],
  }

  const actions = oldHook ? oldHook.queue : []
  actions.forEach((action) => hook.state = action)

  const setState = (action) => {
    hook.queue.push(action)
    nextUnitWork = {
      props: currentRoot.props,
      dom: currentRoot.dom,
      parent: undefined,
      child: undefined,
      alternate: currentRoot,
    }

    wipRoot = nextUnitWork
    delections = []
  }

  wipFiber.hooks.push(hook)
  ++hookIndex

  return [hook.state, setState]
}

function updateFunctionComponent(fiber) {
  // 1.更新函数组件fiber树
  // 2.维护hooks状态

  wipFiber = fiber
  wipFiber.hooks = []
  hookIndex = 0;

  const children = [fiber.type(fiber.props)]
  reconciliationDom(fiber, children)
}

function updateHostComponent(fiber) {
  if (!fiber.dom) {
    fiber.dom = createDom(fiber)
  }

  const elements = fiber.props?.children

  reconciliationDom(fiber, elements)
}

function perFormNextUnitWork(fiber) {
  // 1.构建dom
  // 2.构建子fiber
  // 3.返回下一个工作任务

  const isFunctionComponent = fiber.type instanceof Function;

  if (isFunctionComponent) {
    updateFunctionComponent(fiber)
  } else {
    updateHostComponent(fiber)
  }

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

const isEvent = (key) => key && key.startsWith('on')
const isProperty = (key) => key !== 'children' && !isEvent(key)
const isGone = (prevProps, nextProps) => (key) => !(key in nextProps)
const isNew = (prevProps, nextProps) => (key) => prevProps[key] !== nextProps[key]

function updateDom(dom, prevProps, nextProps) {
  // 重置旧的，赋值新的
  Object.keys(prevProps)
    .filter(isProperty)
    .filter(isGone(prevProps, nextProps))
    .forEach((key) => dom[key] = '')

  Object.keys(prevProps)
    .filter(isEvent)
    .filter((key) =>
      isGone(prevProps, nextProps)(key)
      || isNew(prevProps, nextProps)(key))
    .forEach((key) => {
      const eventType = key.slice(2).toLowerCase()
      dom.removeEventListener(
        eventType,
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

function commitDelection(fiber, parentDom) {
  if (fiber.dom) {
    parentDom.removeChild(fiber.dom)
  } else {
    commitDelection(fiber.child, parentDom)
  }
}

function commitWork(fiber) {
  if (!fiber) {
    return
  }

  let parentFiber = fiber.parent
  while (!parentFiber.dom) {
    parentFiber = parentFiber.parent
  }
  const parentDom = parentFiber.dom

  switch (fiber.effectTag) {
    case EFFECT_PLACEMENT:
      parentDom && fiber.dom && parentDom.appendChild(fiber.dom)
      break;
    case EFFECT_UPDATE:
      fiber.dom && updateDom(fiber.dom, fiber.alternate.props, fiber.props)
      break;
    case EFFECT_DELECTION:
      commitDelection(fiber, parentDom)
      break;
    default:
      break;
  }

  fiber.effectTag = ''

  commitWork(fiber.child)
  commitWork(fiber.sibling)
}

function commitRoot() {
  // 渲染dom
  // 维护wipRoot
  commitWork(wipRoot.child)
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
    nextUnitWork = perFormNextUnitWork(nextUnitWork)
    shouldYield = deadline.timeRemaining > 1
  }

  if (!nextUnitWork && wipRoot) {
    commitRoot()
  }

  requestIdleCallback(workLoop)
}

requestIdleCallback(workLoop)

export function render(element, container) {
  nextUnitWork = {
    props: {
      children: [element]
    },
    dom: container,
    parent: undefined,
    child: undefined,
    alternate: currentRoot,
  }

  wipRoot = nextUnitWork
  delections = []
}
