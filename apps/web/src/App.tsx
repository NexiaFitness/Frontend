/**
 * App principal
 * Configura las rutas de React Router
 */
import React from "react";
import { Routes, Route } from "react-router-dom";
import TestUi from "./pages/TestUi";
import "@nexia/ui-web/styles";


function App() {
  return (
    <Routes>
      <Route path="/" element={<h1 className="text-2xl p-4">Home Page</h1>} />
      <Route path="/test-ui" element={<TestUi />} />
    </Routes>
  );
}

export default App;
