/** @jsxRuntime classic */

import MyReact from './lib'

/** @jsx MyReact.createElement */

const contianer = document.getElementById("root")

// const handleChange = (e) => {
//   renderder(e.target.value);
// }
const handleInput = (e) => {
  renderder(e.target.value);
}

const renderder = (value) => {
  const element = (
    <div>
      <input onInput={handleInput} value={value} />
      <h1>内容：{value}</h1>
    </div>
  );

  MyReact.render(element, contianer);
}

renderder("嘻嘻");
