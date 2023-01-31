import React from 'react';
import ReactDOM from 'react-dom/client';
import './index.css';
import App from "./App";
import {Route, Routes} from "react-router";
import Roll from "./Roll";
import {BrowserRouter} from "react-router-dom";

const root = ReactDOM.createRoot(
  document.getElementById('root') as HTMLElement
);
root.render(
  <React.StrictMode>
    <BrowserRouter>
        <Routes>
            <Route path="/admin/*" element={<App />}></Route>
            <Route path="*" element={<Roll />}></Route>
        </Routes>
    </BrowserRouter>
  </React.StrictMode>
);
