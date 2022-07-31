/** @jsxRuntime classic */
/** @jsx MyReact.createElement */

import MyReact from "./lib";

const contianer = document.getElementById("root") as HTMLElement;

function handleInput(e: any) {
  renderder(e.target.value);
}

function renderder(value: string) {
  const element = (
    <div>
      <input onInput={handleInput} value={value} />
      <h2>内容：{value}</h2>
    </div>
  );

  MyReact.render(element, contianer);
}

renderder("嘻嘻");
