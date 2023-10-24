import "./App.css";
import axios from "axios";
import { useEffect, useState } from "react";
import Input from "./components/Input";
import Feed from "./components/Feed";

function App() {

  return (
    <div className="container">
      <Input />
      <Feed />
    </div>
  );
}

export default App;
