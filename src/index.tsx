/** @jsxRuntime classic */
/** @jsx MyReact.createElement */

import MyReact from "./lib";

const contianer = document.getElementById("root") as HTMLElement;

function App() {
  const [number, setNumber] = MyReact.useState(0);
  const [show, setShow] = MyReact.useState(true);

  return (
    <div>
      <h2 onClick={() => setNumber(number + 1)}>Hello</h2>
      <button onClick={() => setNumber(number + 1)}>increment</button>
      <button onClick={() => setShow(!show)}>toggle</button>
      {show ? <div>{number}</div> : null}
    </div>
  );
}

function Theme() {
  return <h2>Themem</h2>;
}

MyReact.render(
  <div>
    <App />
    <Theme />
  </div>,
  contianer
);
