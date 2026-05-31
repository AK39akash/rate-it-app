import { StrictMode, useState } from "react";
import { createRoot } from "react-dom/client";
import "bootstrap/dist/css/bootstrap.min.css";
import "./index.css";
import { BrowserRouter } from "react-router-dom";
import App from "./App";

function RootApp() {
  return (
    <BrowserRouter>
      <App />
    </BrowserRouter>
  );
}

createRoot(document.getElementById("root")).render(
  <StrictMode>
    <RootApp />
  </StrictMode>
);
