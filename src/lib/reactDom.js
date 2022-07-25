function render(element, container) {
  const dom =
    element.type === 'TEXT_ELEMENT'
      ? document.createTextNode('')
      : document.createElement(element.type)

  const isProperty = (key) => key !== 'children'
  Object.keys(element.props)
    .filter(isProperty)
    .forEach((key) => dom[key] = element.props[key]);

  element.props?.children?.forEach((child) => render(child, dom))

  container.appendChild(dom)
}

const ReactDom = {
  render
}

export default ReactDom