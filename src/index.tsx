// import React from "react";
// import ReactDOM from "react-dom";

import { MyReact, MyReactDom } from "./lib";

const element = MyReact.createElement(
  "div",
  { title: "hello" },
  "我是一个内容",
  MyReact.createElement(
    "p",
    null,
    "我是p标签内容",
    "我是p标签内容",
    "我是p标签内容",
    "我是p标签内容",
    "我是p标签内容",
    "我是p标签内容",
    MyReact.createElement("div", { id: "div" }, "我是div内容")
  ),
  MyReact.createElement(
    "p",
    null,
    "我是p标签内容",
    "我是p标签内容",
    "我是p标签内容",
    "我是p标签内容",
    "我是p标签内容",
    "我是p标签内容",
    MyReact.createElement("div", { id: "div" }, "我是div内容")
  ),
  MyReact.createElement(
    "p",
    null,
    "我是p标签内容",
    "我是p标签内容",
    "我是p标签内容",
    "我是p标签内容",
    "我是p标签内容",
    "我是p标签内容",
    MyReact.createElement("div", { id: "div" }, "我是div内容")
  ),
  MyReact.createElement(
    "p",
    null,
    "我是p标签内容",
    "我是p标签内容",
    "我是p标签内容",
    "我是p标签内容",
    "我是p标签内容",
    "我是p标签内容",
    MyReact.createElement("div", { id: "div" }, "我是div内容")
  )
);

MyReactDom.render(element, document.getElementById("root") as HTMLElement);
