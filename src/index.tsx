/** @jsxRuntime classic */
/** @jsx MyReact.createElement */

import MyReact from "./lib";

const container = document.getElementById("root") as HTMLElement;

function App() {
  const [number, setNumber] = MyReact.useState(0);
  const [show, setShow] = MyReact.useState(true);

  return (
    <div id="app">
      <h2 onClick={() => setNumber(number + 1)}>Hello</h2>
      <button onClick={() => setNumber(number + 1)}>increment</button>
      <button onClick={() => setShow(!show)}>toggle</button>
      {show ? <div>{number}</div> : null}
    </div>
  );
}

// let show = true;
// const handleShow = () => {
//   show = !show;

//   MyReact.render(
//     <div>
//       {/* <App /> */}
//       <button onClick={handleShow}>toggle</button>
//       {show ? <Theme /> : null}
//     </div>,
//     container
//   );
// };

function Theme() {
  return <h2>Theme</h2>;
}

MyReact.render(
  <div>
    <App />
    <Theme />
  </div>,
  container
);
