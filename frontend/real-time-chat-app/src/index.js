import React from "react";
import ReactDOM from "react-dom/client";
import "./index.css";
import App from "./App";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import Room from "./Room";
import reportWebVitals from "./reportWebVitals";
import { UserProvider } from "./UserContext";

const root = ReactDOM.createRoot(document.getElementById("root"));
root.render(
  <React.StrictMode>
    <UserProvider>
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<App />} />
          <Route path="/:roomName" element={<Room />} />
        </Routes>
      </BrowserRouter>
    </UserProvider>
  </React.StrictMode>
);

reportWebVitals();
