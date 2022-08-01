/** @jsxRuntime classic */
/** @jsx MyReact.createElement */

import MyReact from "./lib";

const contianer = document.getElementById("root") as HTMLElement;

let show = true,
  lastValue = "";

function handleInput(e: any) {
  renderder(e.target.value);
}

function handleToggle() {
  show = !show;
  renderder(lastValue);
}

function renderder(value: string) {
  lastValue = value;

  const element = (
    <div>
      <input onInput={handleInput} value={value} />
      <button onClick={handleToggle}>toggle</button>

      {show ? <h2>内容：{value}</h2> : null}
    </div>
  );

  MyReact.render(element, contianer);
}

renderder("嘻嘻");
