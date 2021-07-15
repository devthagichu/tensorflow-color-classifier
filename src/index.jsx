import React from "react";
import ReactDom from "react-dom";
import { RecoilRoot } from "recoil";
import HomeScreen from "./screens/HomeScreen";
import "./styles.scss";

const Main = () => (
  <RecoilRoot>
    {/* <h1>Tensorflow - Let's Go 👋</h1> */}
    <HomeScreen />
  </RecoilRoot>
);

ReactDom.render(<Main />, document.getElementById("app"));
